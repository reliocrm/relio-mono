import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import AuthLayout from "@/components/auth/auth-layout";

export const Route = createFileRoute("/$slug")({
	component: SlugLayoutComponent,
});

function SlugLayoutComponent() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();

	// Client-side auth check - redirect if not authenticated
	useEffect(() => {
		if (!sessionPending && !session?.user) {
			console.log(`[$slug Layout] No user, redirecting to /login`);
			navigate({ to: "/login" });
		}
	}, [session, sessionPending, navigate]);

	if (sessionPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	if (!session?.user) {
		return null; // Will redirect via useEffect
	}

	// Return stable layout - AuthLayout is memoized and will persist
	// Only the <Outlet /> content will update on navigation
	return (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	);
}

