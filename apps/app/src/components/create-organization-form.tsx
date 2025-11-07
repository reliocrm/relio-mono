"use client";

import { useState, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Image as ImageIcon } from "lucide-react";
import { useEdgeStore } from "@relio/storage/provider";

const createSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/^-+|-+$/g, "");
};

export default function CreateOrganizationForm() {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { edgestore } = useEdgeStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [image, setImage] = useState<string>("");
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState(false);

	const origin = typeof window !== "undefined" 
		? window.location.origin.replace(/^https?:\/\//, "")
		: "";

	const [isTransitioning, setIsTransitioning] = useState(false);

	const createOrganizationMutation = useMutation(
		trpc.organization.createOrganization.mutationOptions({
			onSuccess: async (organization) => {
				// Invalidate organizations query to refresh the list
				await queryClient.invalidateQueries({
					predicate: (query) => {
						const queryKey = query.queryKey;
						if (Array.isArray(queryKey) && queryKey[0] && Array.isArray(queryKey[0])) {
							const firstKey = queryKey[0][0];
							return firstKey === 'organization';
						}
						return false;
					},
				});

				toast.success(`${organization.name} created!`, {
					description: "Now, let's go invite some members",
				});

				// Prefetch organization data for the invite page
				if (organization.slug) {
					setIsTransitioning(true);
					
					// Prefetch the organization data so it's ready when we navigate
					await queryClient.prefetchQuery(
						trpc.organization.getCurrentOrganization.queryOptions({
							slug: organization.slug,
						})
					);

					// Small delay for smooth transition
					await new Promise((resolve) => setTimeout(resolve, 300));

					// Navigate to invite members page
					navigate({ 
						to: "/$slug/invite",
						params: { slug: organization.slug }
					});
				} else {
					navigate({ to: "/organizations" });
				}
			},
			onError: (error) => {
				setIsTransitioning(false);
				toast.error(error.message || "Failed to create organization");
			},
		})
	);

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (10MB)
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Image size must be less than 10MB");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const result = await edgestore.images.upload({
				file,
				onProgressChange: (progress) => {
					setUploadProgress(progress);
				},
			});

			setImage(result.url);
			toast.success("Image uploaded successfully");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Failed to upload image");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleRemoveImage = async () => {
		if (image) {
			try {
				await edgestore.images.delete({
					url: image,
				});
			} catch (error) {
				console.error("Delete error:", error);
				// Continue even if delete fails
			}
		}
		setImage("");
	};

	const form = useForm({
		defaultValues: {
			name: "",
		},
		onSubmit: async ({ value }) => {
			const slug = createSlug(value.name);
			createOrganizationMutation.mutate({
				name: value.name,
				slug: slug,
				logo: image || undefined,
			});
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Organization name must be at least 2 characters").max(50, "Organization name must be less than 50 characters"),
			}),
		},
	});

	const [nameValue, setNameValue] = useState("");
	const slugPreview = nameValue ? createSlug(nameValue) : "";

	return (
		<div className="w-full grid grid-cols-1 gap-2 px-4 py-8 relative">
			{isTransitioning && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity">
					<div className="flex flex-col items-center gap-4">
						<Loader />
						<p className="text-sm text-muted-foreground animate-pulse">
							Setting up your organization...
						</p>
					</div>
				</div>
			)}
			<div className="w-full mb-4 flex justify-start items-center">
				<Button
					size="icon"
					variant="outline"
					className="!h-6 w-6"
					onClick={() => navigate({ to: "/organizations" })}
				>
					<ChevronLeft className="size-3" />
				</Button>
				<h1 className="text-md font-bold ml-2">
					Let&rsquo;s set up your organization
				</h1>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-2"
			>
				{/* Organization Logo Section */}
				<div className="grid grid-cols-1 w-full">
					<div className="flex items-start">
						<div className="mr-4 flex items-center">
							{image ? (
								<Avatar className="w-12 h-12 rounded-2xl">
									<AvatarImage src={image} alt={nameValue || "Organization"} />
									<AvatarFallback className="border border-zinc-700 rounded-2xl">
										{nameValue?.[0]?.toUpperCase() || <ImageIcon className="size-4" />}
									</AvatarFallback>
								</Avatar>
							) : (
								<Avatar className="w-12 h-12 rounded-2xl">
									<AvatarFallback className="border border-zinc-700 rounded-2xl">
										{nameValue?.[0]?.toUpperCase() || <ImageIcon className="size-4" />}
									</AvatarFallback>
								</Avatar>
							)}
						</div>

						<div className="flex flex-col">
							<p className="text-base mb-2">Organization Logo</p>
							<div className="flex flex-row space-x-1">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileSelect}
									className="hidden"
									disabled={isUploading || createOrganizationMutation.isPending}
								/>
								<Button
									type="button"
									variant="default"
									size="sm"
									disabled={isUploading || createOrganizationMutation.isPending}
									className="!bg-orange-700 hover:!bg-orange-900 cursor-pointer text-white py-1 px-2 rounded-lg w-20 flex justify-center items-center"
									onClick={() => {
										fileInputRef.current?.click();
									}}
								>
									{isUploading ? `${uploadProgress}%` : "Upload"}
								</Button>
								{image && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={isUploading || createOrganizationMutation.isPending}
										onClick={handleRemoveImage}
										className="!bg-white dark:!bg-transparent dark:hover:!bg-muted hover:!bg-muted !text-gray-700 dark:!text-gray-300 py-1 px-2 rounded-lg w-fit"
									>
										Remove
									</Button>
								)}
							</div>
							<p className="text-xs mt-2 opacity-50">
								We support PNGs, JPEGs, and GIFs under 10MB
							</p>
						</div>
					</div>
				</div>

				{/* Organization Name */}
				<div className="grid grid-cols-1 gap-2 mt-4">
					<div>
						<span className="text-xs text-muted-foreground">Organization Name</span>
						<form.Field name="name">
							{(field) => (
								<div className="mt-1">
									<Input
										placeholder="Name"
										className="ring-foreground/15 border-transparent ring-1"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => {
											field.handleChange(e.target.value);
											setNameValue(e.target.value);
										}}
										autoFocus
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-destructive text-xs mt-1">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
				</div>

				<Separator className="!my-6" />

				{/* Organization URL Preview */}
				<div className="mb-6">
					<p className="text-xs text-muted-foreground">Organization URL</p>
					<p className="text-xs opacity-60 mt-1">
						{origin}/{slugPreview || "your-organization-slug"}
					</p>

					<div className="mt-4">
						<p className="text-xs opacity-60">
							Organization URL is the address where you will access your organization.
						</p>
						<p className="text-xs opacity-60">You can change this later.</p>
					</div>
				</div>

				{/* Submit Button */}
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full h-9"
							disabled={!state.canSubmit || state.isSubmitting || createOrganizationMutation.isPending}
						>
							{state.isSubmitting || createOrganizationMutation.isPending
								? "Creating Organization..."
								: "Create Organization"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

