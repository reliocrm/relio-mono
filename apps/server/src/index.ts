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

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
        // Allow comma-separated origins via CORS_ORIGIN. If not provided, reflect the
        // request origin (dev-friendly) so credentials work in local development.
        origin: (requestOrigin) => {
            const configured = (process.env.CORS_ORIGIN || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (!requestOrigin) return "";
            if (configured.length === 0) return requestOrigin;
            return configured.includes(requestOrigin) ? requestOrigin : "";
        },
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
    // Ensure an Origin header exists for native requests (React Native often omits it).
    const original = c.req.raw;
    const headers = new Headers(original.headers);
    if (!headers.has("Origin")) {
        // Prefer setting to the app scheme to match trustedOrigins
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
