import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { obfuscateTailwindClasses } from "./vite-plugin-obfuscate-classes";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		obfuscateTailwindClasses(),
	],
	server: {
		proxy: {
			"/api/edgestore": {
				target: process.env.VITE_SERVER_URL || "http://localhost:3000",
				changeOrigin: true,
				secure: false,
				ws: false,
				// Rewrite cookies to work with the proxy
				cookieDomainRewrite: {
					"localhost:3000": "localhost:3002",
					"localhost": "localhost",
				},
				cookiePathRewrite: "/",
				configure: (proxy, _options) => {
					proxy.on("proxyRes", (proxyRes, _req, res) => {
						// Rewrite Set-Cookie headers to remove domain or set it to current origin
						const setCookieHeaders = proxyRes.headers["set-cookie"];
						if (setCookieHeaders) {
							const rewrittenCookies = setCookieHeaders.map((cookie) => {
								// Remove domain attribute or rewrite it
								return cookie
									.replace(/;\s*domain=[^;]*/gi, "")
									.replace(/;\s*Domain=[^;]*/gi, "");
							});
							res.setHeader("Set-Cookie", rewrittenCookies);
						}
					});
				},
			},
		},
	},
});
