import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";

export const Route = createFileRoute("/$slug/companies/")({
	component: CompaniesIndexComponent,
});

function CompaniesIndexComponent() {
	const params = Route.useParams();
	const navigate = useNavigate();
	const trpc = useTRPC();
	const { data: session, isPending: sessionPending } = authClient.useSession();

	// Client-side auth check - redirect if not authenticated
	useEffect(() => {
		if (!sessionPending && !session?.user) {
			console.log(`[Companies Index Route] No user, redirecting to /login`);
			navigate({ to: "/login" });
		}
	}, [session, sessionPending, navigate]);

	// Get the default view for companies in this organization
	const viewData = useQuery(
		trpc.view.getDefaultView.queryOptions({
			organizationSlug: params.slug,
			objectType: "company",
		})
	);

	// Redirect to companies/view/[viewId] once we have the view data
	useEffect(() => {
		if (!sessionPending && session?.user && viewData.data?.viewId) {
			console.log(`[Companies Index Route] Redirecting to companies view: ${viewData.data.viewId}`);
			navigate({
				to: "/$slug/companies/view/$viewId",
				params: {
					slug: params.slug,
					viewId: viewData.data.viewId,
				},
			});
		} else if (!sessionPending && session?.user && viewData.error) {
			console.error("Error getting default view:", viewData.error);
			navigate({ to: "/organizations" });
		}
	}, [session, sessionPending, viewData.data, viewData.error, navigate, params.slug]);

	if (sessionPending || viewData.isLoading) {
		return <Loader />;
	}

	if (!session?.user) {
		return null; // Will redirect via useEffect
	}

	return <Loader />; // Will redirect via useEffect
}
