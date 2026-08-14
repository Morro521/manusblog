import { eq, desc, and, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, posts, comments, tags, categories, postTags, galleries, images } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

type CommentTree = typeof comments.$inferSelect & { replies: CommentTree[] };

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.lastSignedIn)).limit(limit).offset(offset);
}

// ============ 文章相关查询 ============

export async function getPublishedPosts(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * 获取文章详情及其真实分类、标签关系。
 * 关联查询与主表查询分离，避免多标签 join 造成文章行重复。
 */
export async function getPostDetailBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  const post = result[0];
  if (!post) return undefined;

  const [category, tagRows] = await Promise.all([
    post.categoryId ? getCategoryById(post.categoryId) : Promise.resolve(undefined),
    db
      .select({ id: tags.id, name: tags.name, slug: tags.slug, description: tags.description })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id)),
  ]);

  return { ...post, category, tags: tagRows };
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPosts(userId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAdminPosts(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).orderBy(desc(posts.updatedAt)).limit(limit).offset(offset);
}

export async function getPostsByCategory(categoryId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function incrementPostViewCount(postId: number) {
  const db = await getDb();
  if (!db) return;
  
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (post.length > 0) {
    await db.update(posts).set({ viewCount: (post[0].viewCount || 0) + 1 }).where(eq(posts.id, postId));
  }
}

export async function getPostCount(status: string = 'published') {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.status, status as any));
  
  return result.length;
}

// ============ 标签相关查询 ============

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tags).orderBy(tags.name);
}

export async function getTagBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTagById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPostsByTag(tagId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({ post: posts })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(and(eq(postTags.tagId, tagId), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

// ============ 分类相关查询 ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ 评论相关查询 ============

export async function getPostComments(postId: number, limit: number = 20, offset: number = 0, viewerId?: number) {
  const db = await getDb();
  if (!db) return [];

  const visibility = viewerId
    ? or(eq(comments.status, 'approved'), and(eq(comments.status, 'pending'), eq(comments.authorId, viewerId)))
    : eq(comments.status, 'approved');
  
  return db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), visibility, isNull(comments.parentCommentId)))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCommentReplies(parentCommentId: number, viewerId?: number): Promise<CommentTree[]> {
  const db = await getDb();
  if (!db) return [];

  return getCommentRepliesFromDb(db, parentCommentId, viewerId);
}

/** 供评论查询和单元测试复用的递归树组装逻辑。 */
export async function getCommentRepliesFromDb(db: any, parentCommentId: number, viewerId?: number): Promise<CommentTree[]> {

  const visibility = viewerId
    ? or(eq(comments.status, 'approved'), and(eq(comments.status, 'pending'), eq(comments.authorId, viewerId)))
    : eq(comments.status, 'approved');
  
  const replies = await db
    .select()
    .from(comments)
    .where(and(eq(comments.parentCommentId, parentCommentId), visibility))
    .orderBy(comments.createdAt) as Array<typeof comments.$inferSelect>;

  return Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      replies: await getCommentRepliesFromDb(db, reply.id, viewerId),
    }))
  );
}

export async function getPendingComments(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(comments)
    .where(eq(comments.status, 'pending'))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ 图片集相关查询 ============

export async function getAllGalleries(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(galleries)
    .orderBy(desc(galleries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getGalleryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(galleries).where(eq(galleries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGalleryImages(galleryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(images)
    .where(eq(images.galleryId, galleryId))
    .orderBy(images.order);
}
