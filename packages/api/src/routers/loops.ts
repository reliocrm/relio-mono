import z from "zod";
import { router, publicProcedure } from "../index";
import { Waitlist } from "@relio/db/models/waitlist.model";

// Prefer server-side calls to Loops API to avoid CORS per docs
// https://loops.so/docs/api-reference

const LOOPS_API_BASE = "https://app.loops.so/api/v1";
const LOOPS_API_KEY = process.env.LOOPS_API_KEY as string || "8a68e55f7119196f1bfcf0e4c4b8fdb6";
const LOOPS_AUDIENCE_ID = process.env.LOOPS_AUDIENCE_ID || "cm17j923m01gcm9zq4rxnb56o";

export const loopsRouter = router({
  joinWaitlist: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!LOOPS_API_KEY) {
        throw new Error("Missing LOOPS_API_KEY");
      }

      // Upsert to local waitlist for counting
      try {
        await Waitlist.updateOne(
          { email: input.email.toLowerCase() },
          {
            $setOnInsert: {
              email: input.email.toLowerCase(),
              createdAt: new Date(),
            },
            $set: {
              subscribed: true,
              source: input.source || "Early Access",
            },
          },
          { upsert: true },
        );
      } catch (e) {
        // continue; don't block Loops call on local write failure
      }

      // Create/subscribe contact in Loops Audience
      try {
        const resp = await fetch(`${LOOPS_API_BASE}/contacts/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOOPS_API_KEY}`,
          },
          body: JSON.stringify({
            email: input.email,
            audienceId: LOOPS_AUDIENCE_ID,
            subscribed: true,
            source: input.source || "Early Access",
            timestamp: new Date().toISOString(),
          }),
        });

        const data: any = await resp.json().catch(() => ({} as any));
        // Treat duplicate contact as success to keep UX smooth
        if (!(resp.ok || (typeof data?.message === "string" && /exist/i.test(data.message)))) {
          return {
            success: false as const,
            message: "Failed to subscribe",
            details: { status: resp.status, data },
          };
        }
      } catch (err) {
        return {
          success: false as const,
          message: "Error calling Loops API",
          details: String(err),
        };
      }

      return {
        success: true as const,
        message: "Successfully subscribed to early access",
      };
    }),

  count: publicProcedure.query(async () => {
    const total = await Waitlist.countDocuments({ subscribed: true }).catch(() => 0);
    return { total };
  }),
});


