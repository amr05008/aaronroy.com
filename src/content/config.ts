import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Non-empty: the description is rendered as the visible dek under every H1.
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
