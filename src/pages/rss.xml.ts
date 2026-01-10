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

      // Convert YouTube iframes to links for RSS readers (many don't support iframes)
      const youtubeLinkedContent = htmlContent.replace(
        /<iframe[^>]*src="https:\/\/(?:www\.)?youtube\.com\/embed\/([^?"]+)[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi,
        (match, videoId) => {
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
          return `<p><strong>📺 Watch on YouTube:</strong> <a href="${youtubeUrl}">${youtubeUrl}</a></p>`;
        }
      );

      // Convert relative URLs to absolute for RSS readers
      const absoluteContent = youtubeLinkedContent
        .replace(/src="\/images\//g, `src="${SITE.url}/images/`)
        .replace(/src="\/og-images\//g, `src="${SITE.url}/og-images/`)
        .replace(/href="\/images\//g, `href="${SITE.url}/images/`)
        .replace(/href="\/og-images\//g, `href="${SITE.url}/og-images/`)
        .replace(/src="\/videos\//g, `src="${SITE.url}/videos/`);

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        categories: post.data.categories,
        link: `/${post.slug}/`,
        content: absoluteContent,
      };
    }),
    customData: `<language>en-us</language>`,
    stylesheet: false,
  });
}
