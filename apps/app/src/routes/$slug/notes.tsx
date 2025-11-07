import { createFileRoute, Link } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";

export const Route = createFileRoute("/$slug/notes")({
	component: NotesComponent,
});

function NotesComponent() {
	const params = Route.useParams();
	const trpc = useTRPC();

	const notes = useQuery(
		trpc.note.getNotes.queryOptions({
			organizationSlug: params.slug,
		})
	);

	if (notes.isLoading) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<Loader />
			</div>
		);
	}

	if (notes.error) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Error</h1>
					<p className="text-muted-foreground">
						{notes.error.message || "Failed to load notes"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full p-4">
			<div className="mb-4">
				<h1 className="text-3xl font-bold">Notes</h1>
			</div>
			<div className="flex-1 overflow-auto border rounded-lg bg-card">
				{notes.data && notes.data.length > 0 ? (
					<div className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{notes.data.map((note) => {
								const NoteCard = note.isPublished ? Link : "div";
								const noteProps = note.isPublished
									? {
											to: "/note/$noteId" as const,
											params: { noteId: note._id?.toString() || "" },
										}
									: {};

								return (
									<NoteCard
										key={note._id?.toString()}
										{...noteProps}
										className={`p-4 border rounded-lg transition-colors ${
											note.isPublished
												? "hover:bg-muted/50 cursor-pointer"
												: "opacity-75"
										}`}
									>
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-semibold text-lg line-clamp-2">
												{note.title}
											</h3>
											{note.isPublished ? (
												<span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
													Published
												</span>
											) : (
												<span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
													Draft
												</span>
											)}
										</div>
										{note.content && (
											<p className="text-sm text-muted-foreground line-clamp-3">
												{note.content}
											</p>
										)}
										{note.updatedAt && (
											<p className="text-xs text-muted-foreground mt-2">
												Updated: {new Date(note.updatedAt).toLocaleDateString()}
											</p>
										)}
									</NoteCard>
								);
							})}
						</div>
					</div>
				) : (
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="text-center">
							<p className="text-muted-foreground">No notes found</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

