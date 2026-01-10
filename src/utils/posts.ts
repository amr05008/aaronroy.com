import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Determines if we're in development mode
 * In Astro, import.meta.env.DEV is true during 'astro dev'
 * and false during 'astro build' and 'astro preview'
 */
export const isDev = import.meta.env.DEV;

/**
 * Filter function to exclude draft posts in production
 * In dev mode, all posts are returned (including drafts)
 * In production, only non-draft posts are returned
 */
export function filterDrafts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  if (isDev) {
    return posts; // Show all posts in dev mode
  }
  return posts.filter(post => !post.data.draft);
}

/**
 * Get all blog posts, excluding drafts in production
 * This is the main function to use across the site
 */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getCollection('blog');
  return filterDrafts(allPosts);
}

/**
 * Get posts for RSS feed
 * Always excludes drafts, even in dev mode
 */
export async function getPostsForRSS(): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getCollection('blog');
  // Always filter drafts, regardless of environment
  return allPosts.filter(post => !post.data.draft);
}

/**
 * Generate URL-friendly slug from category name
 * Converts to lowercase and replaces spaces with hyphens
 * Example: "Product Management" -> "product-management"
 */
export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}
