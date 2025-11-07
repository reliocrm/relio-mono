import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (isPending) return;

		if (session?.user) {
			console.log("[Root Route] User authenticated, redirecting to /organizations");
			navigate({ to: "/organizations" });
		} else {
			console.log("[Root Route] No user, redirecting to /login");
			navigate({ to: "/login" });
		}
	}, [session, isPending, navigate]);

	return <Loader />;
}
