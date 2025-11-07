import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./logo";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session?.user) {
			console.log("[SignInForm] User already authenticated, redirecting to /organizations");
			navigate({ to: "/organizations" });
		}
	}, [session, isPending, navigate]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
							navigate({
								to: "/organizations",
							});
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<section className="bg-linear-to-b from-muted to-background flex min-h-screen px-4 py-16 md:py-32">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="max-w-92 m-auto h-fit w-full"
			>
				<div className="p-6">
					<div>
						<a href="/" aria-label="go home">
							<Logo />
						</a>
						<h1 className="mt-2 text-balance text-xl font-normal">
							<span className="text-muted-foreground">Sign in to continue</span>
						</h1>
					</div>

					<div className="mt-6 space-y-2">
						<Button type="button" variant="outline" size="default" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 256 262">
								<path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
								<path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
								<path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
								<path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
							</svg>
							<span>Google</span>
						</Button>
						<Button type="button" variant="outline" size="default" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 256 256">
								<path fill="currentColor" d="M197.7 136.5c-.2-29.3 23.9-43.3 24.9-44-13.6-19.8-34.8-22.6-42.2-22.9-17.8-1.8-34.6 10.4-43.6 10.4-9 0-22.9-10.1-37.7-9.8-19.4.3-37.2 11.3-47.2 28.7-20.1 34.8-5.1 86.5 14.4 114.9 9.5 13.8 20.8 29.4 35.7 28.8 14.3-.6 19.8-9.3 37.1-9.3 17.3 0 22.2 9.3 37.5 9 15.5-.3 25.2-14 34.5-27.8 10.9-15.9 15.4-31.5 15.6-32.2-.3-.2-29.6-11.3-29.8-44.6ZM164.4 44.6c8.1-9.8 13.5-23.4 12-37.1-11.6.5-25.8 7.6-34.2 17-7.5 8.4-14.1 21.8-11.6 34.6 12.7 1 25.8-6.5 33.8-14.5Z"/>
							</svg>
							<span>Apple</span>
						</Button>
						{/* <Button type="button" variant="outline" size="default" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 256 256">
								<path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
								<path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
								<path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
								<path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
							</svg>
							<span>Microsoft</span>
						</Button> */}
					</div>

					<hr className="mb-5 mt-6" />

					<div className="space-y-6">
						<div className="space-y-2">
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name} className="block text-sm">
											Email
										</Label>
										<Input
											type="email"
											required
											name={field.name}
											id={field.name}
											placeholder="Your email"
											className="ring-foreground/15 border-transparent ring-1"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name} className="block text-sm">
											Password
										</Label>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											placeholder="Your password"
											className="ring-foreground/15 border-transparent ring-1"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button type="submit" className="w-full" disabled={!state.canSubmit || state.isSubmitting}>
									{state.isSubmitting ? "Submitting..." : "Continue"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>

				<div className="px-6">
					<p className="text-muted-foreground text-sm">
						Don't have an account ?
						<Button asChild variant="link" className="px-2">
							<a href="#" onClick={onSwitchToSignUp}>Create account</a>
						</Button>
					</p>
				</div>
			</form>
		</section>
	);
}
