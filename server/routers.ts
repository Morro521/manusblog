import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { posts, comments, tags, categories, postTags, galleries, images, InsertPost, InsertComment, InsertTag, InsertCategory, InsertImage, InsertGallery } from "../drizzle/schema";
import { eq, desc, inArray } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ 文章路由 ============
  posts: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        const offset = (input.page - 1) * input.limit;
        const posts_data = await db.getPublishedPosts(input.limit, offset);
        const total = await db.getPostCount('published');
        return {
          data: posts_data,
          total,
          page: input.page,
          limit: input.limit,
        };
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getPostDetailBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "文章不存在" });
        }
        // 增加阅读量
        await db.incrementPostViewCount(post.id);
        return post;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        tagIds: z.array(z.number().int().positive()).default([]),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        if (input.categoryId) {
          const category = await db.getCategoryById(input.categoryId);
          if (!category) throw new TRPCError({ code: "BAD_REQUEST", message: "所选分类不存在" });
        }

        const tagIds = Array.from(new Set(input.tagIds));
        if (tagIds.length > 0) {
          const validTags = await dbInstance.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds));
          if (validTags.length !== tagIds.length) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "所选标签不存在" });
          }
        }

        const newPost: InsertPost = {
          title: input.title,
          slug: input.slug,
          content: input.content,
          excerpt: input.excerpt,
          coverImage: input.coverImage,
          categoryId: input.categoryId,
          status: input.status,
          authorId: ctx.user.id,
          publishedAt: input.status === 'published' ? new Date() : null,
        };

        const result = await dbInstance.insert(posts).values(newPost);
        const postId = Number(result[0].insertId);
        if (tagIds.length > 0) {
          await dbInstance.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
        }
        return { id: postId, ...newPost, tagIds };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        tagIds: z.array(z.number().int().positive()).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "无权修改此文章" });
        }

        if (input.categoryId !== undefined && input.categoryId !== null) {
          const category = await db.getCategoryById(input.categoryId);
          if (!category) throw new TRPCError({ code: "BAD_REQUEST", message: "所选分类不存在" });
        }

        const tagIds = input.tagIds ? Array.from(new Set(input.tagIds)) : undefined;
        if (tagIds && tagIds.length > 0) {
          const validTags = await dbInstance.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds));
          if (validTags.length !== tagIds.length) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "所选标签不存在" });
          }
        }

        const updateData: any = { ...input };
        delete updateData.id;
        delete updateData.tagIds;
        if (input.status === 'published' && post.status !== 'published') {
          updateData.publishedAt = new Date();
        }

        await dbInstance.update(posts).set(updateData).where(eq(posts.id, input.id));
        if (tagIds) {
          await dbInstance.delete(postTags).where(eq(postTags.postId, input.id));
          if (tagIds.length > 0) {
            await dbInstance.insert(postTags).values(tagIds.map((tagId) => ({ postId: input.id, tagId })));
          }
        }
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await dbInstance.delete(posts).where(eq(posts.id, input.id));
        return { success: true };
      }),

    myPosts: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      }))
      .query(async ({ input, ctx }) => {
        const offset = (input.page - 1) * input.limit;
        const posts_data = await db.getUserPosts(ctx.user.id, input.limit, offset);
        return { data: posts_data, page: input.page };
      }),
  }),

  // ============ 标签路由 ============
  tags: router({
    list: publicProcedure.query(() => db.getAllTags()),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newTag: InsertTag = input;
        const result = await dbInstance.insert(tags).values(newTag);
        return { id: result[0].insertId, ...newTag };
      }),
  }),

  // ============ 分类路由 ============
  categories: router({
    list: publicProcedure.query(() => db.getAllCategories()),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newCategory: InsertCategory = input;
        const result = await dbInstance.insert(categories).values(newCategory);
        return { id: result[0].insertId, ...newCategory };
      }),
  }),

  // ============ 评论路由 ============
  comments: router({
    list: publicProcedure
      .input(z.object({
        postId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        const offset = (input.page - 1) * input.limit;
        const viewerId = ctx.user?.id;
        const comments_data = await db.getPostComments(input.postId, input.limit, offset, viewerId);
        
        // 获取每条评论的回复
        const commentsWithReplies = await Promise.all(
          comments_data.map(async (comment) => {
            const replies = await db.getCommentReplies(comment.id, viewerId);
            return { ...comment, replies };
          })
        );

        return { data: commentsWithReplies, page: input.page };
      }),

    create: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1),
        parentCommentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newComment: InsertComment = {
          ...input,
          authorId: ctx.user.id,
          status: 'pending', // 新评论需要审核
        };

        const result = await dbInstance.insert(comments).values(newComment);
        return { id: result[0].insertId, ...newComment };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const comment = await db.getCommentById(input.id);
        if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
        if (comment.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await dbInstance.delete(comments).where(eq(comments.id, input.id));
        return { success: true };
      }),
  }),

  // ============ 管理员路由 ============
  admin: router({
    comments: router({
      pending: adminProcedure
        .input(z.object({
          page: z.number().default(1),
          limit: z.number().default(20),
        }))
        .query(async ({ input }) => {
          const offset = (input.page - 1) * input.limit;
          return db.getPendingComments(input.limit, offset);
        }),

      approve: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const dbInstance = await getDb();
          if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await dbInstance.update(comments).set({ status: 'approved' }).where(eq(comments.id, input.id));
          return { success: true };
        }),

      reject: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const dbInstance = await getDb();
          if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          await dbInstance.update(comments).set({ status: 'rejected' }).where(eq(comments.id, input.id));
          return { success: true };
        }),
    }),
  }),

  // ============ 图片集路由 ============
  galleries: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        const offset = (input.page - 1) * input.limit;
        return db.getAllGalleries(input.limit, offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const gallery = await db.getGalleryById(input.id);
        if (!gallery) throw new TRPCError({ code: "NOT_FOUND" });

        const gallery_images = await db.getGalleryImages(input.id);
        return { ...gallery, images: gallery_images };
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newGallery: InsertGallery = input;
        const result = await dbInstance.insert(galleries).values(newGallery);
        return { id: result[0].insertId, ...newGallery };
      }),

    addImage: adminProcedure
      .input(z.object({
        galleryId: z.number(),
        url: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newImage: InsertImage = input;
        const result = await dbInstance.insert(images).values(newImage);
        return { id: result[0].insertId, ...newImage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
