import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";

export const Route = createFileRoute("/$slug/tasks")({
	component: TasksComponent,
});

function TasksComponent() {
	const params = Route.useParams();
	const trpc = useTRPC();

	const tasks = useQuery(
		trpc.task.getTasks.queryOptions({
			organizationSlug: params.slug,
		})
	);

	if (tasks.isLoading) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<Loader />
			</div>
		);
	}

	if (tasks.error) {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Error</h1>
					<p className="text-muted-foreground">
						{tasks.error.message || "Failed to load tasks"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full p-4">
			<div className="mb-4">
				<h1 className="text-3xl font-bold">Tasks</h1>
			</div>
			<div className="flex-1 overflow-auto border rounded-lg bg-card">
				{tasks.data && tasks.data.length > 0 ? (
					<div className="p-4">
						<div className="space-y-2">
							{tasks.data.map((task) => (
								<div
									key={task._id?.toString()}
									className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="font-semibold text-lg">{task.title}</h3>
											{task.description && (
												<p className="text-sm text-muted-foreground mt-1">
													{task.description}
												</p>
											)}
											<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
												{task.status && (
													<span className="capitalize">{task.status}</span>
												)}
												{task.priority && (
													<span className="capitalize">
														{task.priority.replace("_", " ")}
													</span>
												)}
												{task.dueDate && (
													<span>
														Due: {new Date(task.dueDate).toLocaleDateString()}
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="flex-1 flex items-center justify-center p-8">
						<div className="text-center">
							<p className="text-muted-foreground">No tasks found</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
