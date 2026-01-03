import rss from '@astrojs/rss';
import { SITE, AUTHOR } from '../config';
import type { APIContext } from 'astro';
import { marked } from 'marked';
import { getPostsForRSS } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPostsForRSS();

  // Sort posts by publication date (newest first)
  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  // Configure marked for RSS-friendly HTML
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Don't convert \n to <br>
  });

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site || SITE.url,
    items: sortedPosts.map((post) => {
      // Convert markdown to HTML
      const htmlContent = marked.parse(post.body);

      // Convert relative URLs to absolute for RSS readers
      const absoluteContent = htmlContent
        .replace(/src="\/images\//g, `src="${SITE.url}/images/`)
        .replace(/src="\/og-images\//g, `src="${SITE.url}/og-images/`)
        .replace(/href="\/images\//g, `href="${SITE.url}/images/`)
        .replace(/href="\/og-images\//g, `href="${SITE.url}/og-images/`);

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        categories: post.data.categories,
        link: `/${post.slug}/`,
        content: absoluteContent,
        author: `${AUTHOR.email} (${AUTHOR.name})`,
      };
    }),
    customData: `<language>en-us</language>`,
    stylesheet: false,
  });
}
