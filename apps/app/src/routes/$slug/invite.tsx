import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import RootLayout from "@/components/layout/root-layout";
import InviteMembersForm from "@/components/invite-members-form";
import Loader from "@/components/loader";

export const Route = createFileRoute("/$slug/invite")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && !session?.user) {
			console.log("[Invite Members Route] No user, redirecting to /login");
			navigate({ to: "/login" });
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return <Loader />;
	}

	if (!session?.user) {
		return null;
	}

	return (
		<RootLayout auth={true}>
			<InviteMembersForm />
		</RootLayout>
	);
}

