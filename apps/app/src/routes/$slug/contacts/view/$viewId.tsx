import { createFileRoute } from "@tanstack/react-router";
import { ObjectHeader } from "@/components/objects/object-header";

export const Route = createFileRoute("/$slug/contacts/view/$viewId")({
	component: ContactsViewComponent,
});

function ContactsViewComponent() {
	const params = Route.useParams();

	return (
		<div className="flex flex-col h-full">
			<ObjectHeader 
				organizationSlug={params.slug} 
				objectType="contact" 
				currentViewId={params.viewId} 
			/>
		</div>
	);
}

