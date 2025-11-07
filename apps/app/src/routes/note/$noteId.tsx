import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";

export const Route = createFileRoute("/note/$noteId")({
	component: PublicNoteComponent,
});

function PublicNoteComponent() {
	const params = Route.useParams();
	const trpc = useTRPC();

	const note = useQuery(
		trpc.note.getPublicNote.queryOptions({
			noteId: params.noteId,
		})
	);

	if (note.isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Loader />
			</div>
		);
	}

	if (note.error) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<h1 className="text-2xl font-bold mb-2">Note Not Found</h1>
					<p className="text-muted-foreground">
						{note.error.message || "This note does not exist or is not publicly available."}
					</p>
				</div>
			</div>
		);
	}

	if (!note.data) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center">
					<p className="text-muted-foreground">Note not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto p-8">
				<article className="prose prose-slate dark:prose-invert max-w-none">
					{note.data.coverImage && (
						<div className="mb-8 -mx-8">
							<img
								src={note.data.coverImage}
								alt={note.data.title}
								className="w-full h-64 object-cover rounded-lg"
							/>
						</div>
					)}
					<header className="mb-8">
						{note.data.icon && (
							<div className="text-4xl mb-4">{note.data.icon}</div>
						)}
						<h1 className="text-4xl font-bold mb-4">{note.data.title}</h1>
						{note.data.updatedAt && (
							<p className="text-sm text-muted-foreground">
								Last updated: {new Date(note.data.updatedAt).toLocaleDateString()}
							</p>
						)}
					</header>
					{note.data.content && (
						<div
							className="mt-8 prose prose-slate dark:prose-invert"
							dangerouslySetInnerHTML={{ __html: note.data.content }}
						/>
					)}
				</article>
			</div>
		</div>
	);
}

