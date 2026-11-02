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

// The plugin's project, privacy and terms pages (src/pages/competitive-analysis/).
// Aaron edits them in Obsidian through the vault's _areas/competitive-analysis/site symlink.
const competitiveAnalysis = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(1),
  }),
});

export const collections = { blog, 'competitive-analysis': competitiveAnalysis };
