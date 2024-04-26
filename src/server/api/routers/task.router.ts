import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.task.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
      include: {
        createdBy: true,
        priority: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(512, "Name is too long"),
        description: z.string().max(8192, "Description is too long").optional(),
        completed: z.boolean(),
        deadline: z.string().optional(),
        priority: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.create({
        data: {
          name: input.name,
          description: input.description,
          completed: input.completed,
          deadline: input.deadline ? new Date(input.deadline) : null,
          createdBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          priority: {
            connect: {
              id: input.priority,
            },
          },
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.task.delete({
      where: {
        id: input,
        createdBy: { id: ctx.session.user.id },
      },
    });
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(512, "Name is too long"),
        description: z.string().max(8192, "Description is too long").optional(),
        completed: z.boolean(),
        deadline: z.string().optional(),
        priority: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.update({
        where: {
          id: input.id,
          createdBy: { id: ctx.session.user.id },
        },
        data: {
          name: input.name,
          description: input.description,
          completed: input.completed,
          deadline: input.deadline ? new Date(input.deadline) : null,
          priority: {
            connect: {
              id: input.priority,
            },
          },
        },
      });
    }),
  markAsCompleted: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.task.update({
      where: {
        id: input,
        createdBy: { id: ctx.session.user.id },
      },
      data: {
        completed: true,
      },
    });
  }),
  markAsNotCompleted: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    return ctx.db.task.update({
      where: {
        id: input,
        createdBy: { id: ctx.session.user.id },
      },
      data: {
        completed: false,
      },
    });
  }),
});
