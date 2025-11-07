"use client";

import * as React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button, IconButton } from "@/components/ui/button";
import { ChevronRight, Minus } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SHARE_ROLES, type OrganizationRole } from "@/constants/roles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loader from "@/components/loader";

const inviteSchema = z.object({
	email: z.string().email(),
	role: z.string().min(1, "Role is required"),
});

const formSchema = z.object({
	invites: z.array(inviteSchema).min(1),
});

export default function InviteMembersForm() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const trpc = useTRPC();
	const slug = params.slug as string;

	// Get current organization
	const { data: organization, isLoading: isLoadingOrg } = useQuery({
		...trpc.organization.getCurrentOrganization.queryOptions({
			slug: slug,
		}),
		enabled: !!slug,
	});

	// Show loading state while fetching organization
	if (isLoadingOrg) {
		return (
			<div className="w-full grid grid-cols-1 gap-2">
				<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
					<Loader />
					<p className="text-sm text-muted-foreground animate-pulse">
						Loading organization...
					</p>
				</div>
			</div>
		);
	}

	if (!organization) {
		return (
			<div className="w-full grid grid-cols-1 gap-2">
				<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
					<p className="text-sm text-destructive">Organization not found</p>
					<Button
						onClick={() => navigate({ to: "/organizations" })}
						variant="outline"
					>
						Go back to organizations
					</Button>
				</div>
			</div>
		);
	}

	// Note: User ID will be extracted from the session in the API endpoint

	const createInvitationsMutation = useMutation(
		trpc.invitation.createInvitations.mutationOptions({
			onSuccess: () => {
				toast.success("Invitations sent successfully");
				navigate({
					to: "/$slug",
					params: { slug: slug },
				});
			},
			onError: (error) => {
				toast.error(error.message || "Error sending invitations");
			},
		})
	);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			invites: [{ email: "", role: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "invites",
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!organization?._id) {
			toast.error("Organization not found");
			return;
		}

		const filledInvites = values.invites
			.filter((invite) => invite.email && invite.role)
			.map((invite) => ({
				email: invite.email,
				role: invite.role as OrganizationRole,
			}));

		if (filledInvites.length === 0) {
			toast.error("Please add at least one valid invitation.");
			return;
		}

		createInvitationsMutation.mutate({
			organizationId: organization._id.toString(),
			invitations: filledInvites,
		});
	}

	const handleSkip = () => {
		toast.success("Skipping inviting members", {
			description: "You can always invite members later",
		});
		navigate({
			to: "/$slug",
			params: { slug: slug },
		});
	};

	const addNewEmail = () => {
		append({ email: "", role: "" });
	};

	return (
		<div className="w-full grid grid-cols-1 gap-2 animate-in fade-in duration-300">
			<div className="w-full mb-4 flex justify-start items-center">
				<h1 className="text-md font-bold ml-2">
					Collaborate with your team
				</h1>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
					<div className="grid grid-cols-1 gap-1">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="w-full flex flex-row items-center justify-between space-x-2"
							>
								<div className={"!w-[80%]"}>
									<FormField
										control={form.control}
										name={`invites.${index}.email`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Email" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div
									className={cn(
										"!w-[20%]",
										fields.length > 1 && "!w-[15%]"
									)}
								>
									<FormField
										control={form.control}
										name={`invites.${index}.role`}
										render={({ field }) => (
											<FormItem>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger
															className={
																"!h-8 !w-full !bg-transparent hover:!border-orange-700"
															}
														>
															<SelectValue placeholder="Role" />
														</SelectTrigger>
													</FormControl>
													<SelectContent className={"!hover-bg !bg-zinc-900"}>
														{SHARE_ROLES.map((role) => (
															<SelectItem
																key={role.value}
																value={role.value}
																className="truncate"
															>
																{role.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								{fields.length > 1 && (
									<div className={"!w-[5%]"}>
										<IconButton
											className={"border-none !h-8 !w-8"}
											onClick={() => remove(index)}
											icon={<Minus size={12} />}
										/>
									</div>
								)}
							</div>
						))}
					</div>
					<div
						onClick={addNewEmail}
						className="mt-2 text-xs w-fit hover:underline cursor-pointer"
					>
						Add another email
					</div>

					<Separator className="!my-6" />

					<div className="mb-3">
						<div className="mt-4">
							<p className="text-xs opacity-40">
								Introducing seamless collaboration in your real estate
								endeavors! Invite team members to your organization and
								experience a new level of efficiency.
							</p>
							<br />
							<p className="text-xs opacity-40">
								Empower your team by extending invitations to collaborate within
								Relio. Transform the way you work together and amplify your
								success in commercial real estate with Relio&rsquo;s
								purpose-built collaborative ecosystem.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-2 !mt-6">
						<Button
							disabled={createInvitationsMutation.isPending}
							className="w-full h-7"
							type="submit"
						>
							{createInvitationsMutation.isPending
								? "Sending Invitations..."
								: "Send Invitations"}
						</Button>
						<Button
							className="text-muted-foreground py-1 px-2 rounded-lg bg-transparent hover:underline hover:bg-transparent hover:text-accent-foreground"
							type="button"
							onClick={handleSkip}
						>
							Skip <ChevronRight size={12} /> Let&apos;s go to your dashboard!
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

