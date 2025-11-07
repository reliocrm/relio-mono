import { authClient } from "@/lib/auth-client";

/**
 * Get session with proper error handling and retry logic
 * This ensures cookies are properly read on page refresh
 * 
 * Note: HttpOnly cookies cannot be read from JavaScript, but they are automatically
 * sent with requests that include credentials: "include"
 */
export async function getSessionWithRetry(maxRetries = 8, initialDelay = 100): Promise<{ data: { user?: any } | null; error?: any }> {
	console.log("[getSessionWithRetry] Starting session retrieval");
	
	// Check if we're in browser environment
	if (typeof window === "undefined") {
		console.log("[getSessionWithRetry] Not in browser environment, returning null");
		return { data: null };
	}

	// Check if cookies are accessible (though httpOnly cookies won't be visible)
	console.log("[getSessionWithRetry] Document cookies:", document.cookie);
	console.log("[getSessionWithRetry] Auth client baseURL:", import.meta.env.VITE_SERVER_URL);

	// On page load/refresh, give the browser a moment to stabilize
	// This helps ensure cookies are available
	console.log(`[getSessionWithRetry] Waiting ${initialDelay}ms before first attempt...`);
	await new Promise((resolve) => setTimeout(resolve, initialDelay));

	for (let i = 0; i < maxRetries; i++) {
		console.log(`[getSessionWithRetry] Attempt ${i + 1}/${maxRetries}`);
		
		try {
			// Use getSession with explicit fetch options to ensure cookies are sent
			// The httpOnly cookie will be automatically included by the browser
			const sessionUrl = `${import.meta.env.VITE_SERVER_URL}/api/auth/session`;
			console.log(`[getSessionWithRetry] Calling getSession, URL: ${sessionUrl}`);
			
			const session = await authClient.getSession({
				fetchOptions: {
					credentials: "include",
					mode: "cors",
					cache: "no-store",
				},
			});
			
			console.log(`[getSessionWithRetry] Session response:`, {
				hasData: !!session?.data,
				hasUser: !!session?.data?.user,
				userId: session?.data?.user?.id,
				userEmail: session?.data?.user?.email,
				error: session?.error,
				fullResponse: session,
			});
			
			// If we got a session with a user, return it immediately
			if (session?.data?.user) {
				console.log("[getSessionWithRetry] ✅ Successfully retrieved session with user");
				return session;
			}
			
			// If we got a session response but no user, the session might be invalid/expired
			// However, on page refresh, cookies might not be immediately available
			// So we'll retry a few times with increasing delays
			if (i < maxRetries - 1) {
				// Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
				const waitTime = initialDelay * Math.pow(2, i);
				console.log(`[getSessionWithRetry] No user found, retrying in ${waitTime}ms...`);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}
			
			// Last attempt, return what we have
			console.log("[getSessionWithRetry] ⚠️ Last attempt - no user found, returning session or null");
			return session || { data: null };
		} catch (error: any) {
			console.error(`[getSessionWithRetry] ❌ Error on attempt ${i + 1}:`, {
				message: error?.message,
				stack: error?.stack,
				status: error?.status,
				statusText: error?.statusText,
				fullError: error,
			});
			
			// Network errors or server errors - retry with backoff
			if (i < maxRetries - 1) {
				// Exponential backoff
				const waitTime = initialDelay * Math.pow(2, i);
				console.log(`[getSessionWithRetry] Retrying after error in ${waitTime}ms...`);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}
			// Last attempt failed
			console.error("[getSessionWithRetry] ❌ All retries exhausted, returning null");
			return { data: null, error };
		}
	}
	
	console.log("[getSessionWithRetry] ❌ All retries exhausted without success");
	return { data: null };
}

