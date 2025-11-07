import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$slug/dashboard")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const params = Route.useParams();

	return (
		<div className="flex flex-col h-full p-4">
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome to {params.slug} dashboard
					</p>
				</div>
			</div>
		</div>
	);
}

