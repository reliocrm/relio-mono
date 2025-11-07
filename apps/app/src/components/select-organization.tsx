"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "@tanstack/react-router";
import Loader from "@/components/loader";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

const SelectOrganization = () => {
	const navigate = useNavigate();
	const trpc = useTRPC();

	const organizations = useQuery(
		trpc.organization.getUserOrganizations.queryOptions({
			status: "active",
		})
	);

	if (organizations.isLoading) {
		return <Loader />;
	}

	const origin = typeof window !== 'undefined'
		? window.location.origin.replace(/^https?:\/\//, '')
		: '';

	return (
		<div className='w-full grid grid-cols-1'>
			<div className='w-full mb-8 flex justify-center items-center flex-col space-y-1'>
				{organizations.data && organizations.data?.length > 0 ? (
				<h1 className='text-xl font-semibold ml-2'>
					Select Organization
				</h1>
				) : (
					<h1 className='text-xl font-bold ml-2'>
						No Organizations
					</h1>
				)}

                <span className="text-sm text-muted-foreground">
                    Select an organization to continue
                </span>
			</div>
			<div className="flex flex-col justify-start items-start space-y-2">
			{organizations.data?.map((organization) => {
				if (!organization._id || !organization.slug) return null;
				return (
				<div
					key={organization._id.toString()}
					className="group cursor-pointer w-full border border-border rounded-2xl p-2 transition-colors hover:bg-muted/50"
					onClick={() => navigate({ to: `/${organization.slug}` })}
				>
					<div className="w-full flex flex-row justify-between items-center">
						<div className="flex flex-row items-center gap-2">
							<div>
								<Avatar className="size-8 rounded-lg">
									<AvatarImage className="size-8 rounded-lg bg-muted" src={organization.logo || undefined} />
									<AvatarFallback className="size-8 rounded-lg">{organization.name.charAt(0).toUpperCase()}</AvatarFallback>
								</Avatar>
							</div>
		
							<div className="flex flex-col justify-start items-start">
								<h2 className="text-md font-bold">{organization.name}</h2>
								<div className="flex flex-row justify-start items-center">
									<p className="text-xs text-zinc-500 dark:text-zinc-500">{origin}/</p>
									<p className="text-xs text-zinc-800 dark:text-zinc-500">{organization.slug}</p>
								</div>
							</div>
						</div>
						<div className="flex flex-row justify-end items-center gap-2">
							<ChevronRight className="size-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					</div>
				</div>
				);
			})}
			</div>
			<Separator className="my-6" />

			{/* Create Organization Button */}
			<div className="w-full flex flex-row justify-center items-center">
				<Button variant="ghost" onClick={() => {
					navigate({ to: "/organizations/create" });
				}} className="w-full bg-transparent! rounded-lg space-x-2 hover:bg-zinc-100/80! dark:hover:bg-accent/80! transition-colors">
					<Plus className="size-4 text-muted-foreground" />
					<span className="text-sm font-medium text-muted-foreground">Create new organization</span>
				</Button>
			</div>
		</div>
	)
}

export default SelectOrganization

