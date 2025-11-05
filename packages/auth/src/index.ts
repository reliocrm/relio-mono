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
			sameSite: "none",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		},
	},
  plugins: [expo()]
});
