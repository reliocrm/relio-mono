import { expo } from '@better-auth/expo';
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@relio/db";

export const auth = betterAuth<BetterAuthOptions>({
	database: mongodbAdapter(client),
	trustedOrigins: [
		// Support comma-separated list in CORS_ORIGIN for multiple allowed origins
		...(process.env.CORS_ORIGIN
			? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
			: []),
		"relio://",
		"exp://",
		"null",
	],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			// In production we require secure cookies; in local dev (http://localhost)
			// allow non-secure so cookies can be set during development.
			// Note: Cookies cannot be shared across different ports on localhost
			// Each app (web:3001, app:3002) will have separate cookie storage
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			// In development, we can't share cookies across ports, but we can set
			// path to "/" to ensure cookies work for all paths on the same origin
			path: "/",
			// For production, allow setting a custom domain for cookie sharing
			...(process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN
				? { domain: process.env.COOKIE_DOMAIN }
				: {}),
		},
	},
  plugins: [expo()]
});
