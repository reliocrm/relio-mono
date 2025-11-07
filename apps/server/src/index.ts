import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@relio/api/context";
import { appRouter } from "@relio/api/routers/index";
import { auth } from "@relio/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { createEdgeStoreHonoHandler } from "@edgestore/server/adapters/hono";
import { edgeStoreRouter } from "@relio/storage";

const app = new Hono();

app.use(logger());

app.use(
	"/*",
	cors({
        origin: (requestOrigin) => {
            const configured = (process.env.CORS_ORIGIN || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            
            // Always allow localhost origins in development
            const isDev = process.env.NODE_ENV !== "production";
            if (isDev && requestOrigin) {
                const url = new URL(requestOrigin);
                if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
                    return requestOrigin;
                }
            }
            
            if (!requestOrigin) return "";
            if (configured.length === 0) return requestOrigin;
            return configured.includes(requestOrigin) ? requestOrigin : "";
        },
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "Cookie"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    const original = c.req.raw;
    const headers = new Headers(original.headers);
    if (!headers.has("Origin")) {
        headers.set("Origin", "relio://");
    }
    const reqWithOrigin = new Request(original, { headers });
    return auth.handler(reqWithOrigin);
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.post("/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const result = streamText({
		model: google("gemini-2.5-flash"),
		messages: convertToModelMessages(uiMessages),
	});

	return result.toUIMessageStreamResponse();
});

// Create EdgeStore handler
// Configure cookies to work with the Vite proxy
const isDev = process.env.NODE_ENV !== "production";
const edgeStoreHandler = createEdgeStoreHonoHandler({
	router: edgeStoreRouter,
	cookieConfig: {
		ctx: {
			options: {
				path: "/",
				sameSite: isDev ? "lax" : "strict",
				secure: !isDev, // false for localhost development, true for production
				httpOnly: false, // Allow client-side access in development
			},
		},
		token: {
			options: {
				path: "/",
				sameSite: isDev ? "lax" : "strict", 
				secure: !isDev, // false for localhost development, true for production
				httpOnly: false, // Allow client-side access in development
			},
		},
	},
});

// Create a sub-app for EdgeStore
const edgeStoreApp = new Hono();

// Middleware to rewrite the request URL before passing to EdgeStore handler
// EdgeStore handler reads pathname from c.req.url, so we need to modify it
// When Hono routes to a sub-app, c.req.path is already stripped, but c.req.url still has the full path
edgeStoreApp.use("*", async (c, next) => {
	try {
		// Use the path from c.req.path (already stripped by Hono routing)
		// or fallback to stripping from URL if needed
		const edgeStorePath = c.req.path || "/";
		const originalUrl = new URL(c.req.url);
		
		// Create a new URL with just the EdgeStore path (without /api/edgestore prefix)
		const modifiedUrl = new URL(edgeStorePath + originalUrl.search, originalUrl.origin);
		
		// Create a new Request object with modified URL but same body and headers
		const body = c.req.method !== "GET" && c.req.method !== "HEAD" 
			? await c.req.raw.clone().arrayBuffer() 
			: undefined;
		
		const modifiedRequest = new Request(modifiedUrl.toString(), {
			method: c.req.method,
			headers: c.req.header(),
			body: body,
		});
		
		// Replace the raw request in the context
		// This will make c.req.url return the modified URL
		c.req.raw = modifiedRequest;
		
		await next();
	} catch (error) {
		console.error("[EdgeStore Middleware] Error:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Mount the EdgeStore handler on the sub-app
edgeStoreApp.all("*", edgeStoreHandler);

// Mount the sub-app at /api/edgestore
// Hono will automatically strip the /api/edgestore prefix when routing to the sub-app
app.route("/api/edgestore", edgeStoreApp);

app.get("/", (c) => {
	return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
