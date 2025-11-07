import { protectedProcedure, publicProcedure, router } from "../index";
import { todoRouter } from "./todo";
import { loopsRouter } from "./loops";
import { organizationRouter } from "./organization";
import { viewRouter } from "./view";
import { invitationRouter } from "./invitation";
import { notificationRouter } from "./notification";
import { noteRouter } from "./note";
import { taskRouter } from "./task";
import { favoriteRouter } from "./favorite";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
  loops: loopsRouter,
  organization: organizationRouter,
  view: viewRouter,
  invitation: invitationRouter,
  notification: notificationRouter,
  note: noteRouter,
  task: taskRouter,
  favorite: favoriteRouter,
});
export type AppRouter = typeof appRouter;
