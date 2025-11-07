import { createFileRoute } from "@tanstack/react-router";
import { ObjectHeader } from "@/components/objects/object-header";

export const Route = createFileRoute("/$slug/properties/view/$viewId")({
	component: PropertiesViewComponent,
});

function PropertiesViewComponent() {
	const params = Route.useParams();

	return (
		<div className="flex flex-col h-full">
			<ObjectHeader 
				organizationSlug={params.slug} 
				objectType="property" 
				currentViewId={params.viewId} 
			/>
			{/* View content will go here */}
		</div>
	);
}

