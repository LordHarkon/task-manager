import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const priorityRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.priority.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
      include: {
        createdBy: true,
      },
      orderBy: {
        value: "asc",
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(512, "Name is too long"),
        value: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if priority with the same value already exists
      const existingPriority = await ctx.db.priority.findFirst({
        where: {
          value: input.value,
          createdBy: { id: ctx.session.user.id },
        },
      });

      if (existingPriority) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Priority with the same value already exists",
        });
      } else {
        return ctx.db.priority.create({
          data: {
            name: input.name,
            value: input.value,
            createdBy: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });
      }
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const tasks = await ctx.db.task.findMany({
      where: {
        priority: { id: input },
      },
    });

    if (tasks.length > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This priority is used for one or more tasks",
      });
    } else {
      return ctx.db.priority.delete({
        where: {
          id: input,
          createdBy: { id: ctx.session.user.id },
        },
      });
    }
  }),
});
