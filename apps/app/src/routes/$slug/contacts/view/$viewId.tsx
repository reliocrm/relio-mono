import { createFileRoute } from "@tanstack/react-router";
import { ObjectHeader } from "@/components/objects/object-header";
import { ObjectTableView } from "@/components/objects/object-table-view";

export const Route = createFileRoute("/$slug/contacts/view/$viewId")({
	component: ContactsViewComponent,
});

function ContactsViewComponent() {
	const params = Route.useParams();

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<ObjectHeader 
				organizationSlug={params.slug} 
				objectType="contact" 
				currentViewId={params.viewId} 
			/>
			<div className="flex-1 overflow-hidden">
				<ObjectTableView
					organizationSlug={params.slug}
					objectType="contact"
					viewId={params.viewId}
				/>
			</div>
		</div>
	);
}

