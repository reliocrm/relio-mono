import type { auth } from "@relio/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins: [inferAdditionalFields<typeof auth>()],
	fetchOptions: {
		credentials: "include", // Ensure cookies are sent with every request
	},
});
