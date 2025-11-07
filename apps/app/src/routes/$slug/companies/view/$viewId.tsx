import { createFileRoute } from "@tanstack/react-router";
import { ObjectHeader } from "@/components/objects/object-header";

export const Route = createFileRoute("/$slug/companies/view/$viewId")({
	component: CompaniesViewComponent,
});

function CompaniesViewComponent() {
	const params = Route.useParams();

	return (
		<div className="flex flex-col h-full">
			<ObjectHeader 
				organizationSlug={params.slug} 
				objectType="company" 
				currentViewId={params.viewId} 
			/>
			{/* View content will go here */}
		</div>
	);
}

