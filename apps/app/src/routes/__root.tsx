import { Toaster } from "@/components/ui/sonner";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "../index.css?url";
import type { QueryClient } from "@tanstack/react-query";
import Loader from "@/components/loader";
import { ThemeProvider } from "next-themes";
import { EdgeStoreProvider } from "@relio/storage/provider";

import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@relio/api/routers/index";
import type { TRPCClient } from "@trpc/client";
export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
	trpcClient: TRPCClient<AppRouter>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Relio",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
				suppressHydrationWarning: true,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const isFetching = useRouterState({ select: (s) => s.isLoading });
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="h-screen overflow-hidden">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
					<EdgeStoreProvider>
						<div className="grid h-svh grid-rows-[auto_1fr] bg-linear-to-b from-muted to-background overflow-hidden">
							<Outlet />
							{isFetching && (
								<div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
									<Loader />
								</div>
							)}
						</div>
						<Toaster richColors />
						<TanStackRouterDevtools position="bottom-left" />
						<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
					</EdgeStoreProvider>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
