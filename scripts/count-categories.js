import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, '../src/content/blog');

// Read all blog post files
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

const categoryData = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];

    // Extract title
    const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?\n/);
    const title = titleMatch ? titleMatch[1] : file;

    // Extract categories
    const categoriesMatch = frontmatter.match(/categories:\s*\[(.*?)\]/);
    if (categoriesMatch) {
      const categoriesStr = categoriesMatch[1];
      // Parse categories (handle both quoted and unquoted)
      const categories = categoriesStr
        .split(',')
        .map(cat => cat.trim().replace(/['"]/g, ''))
        .filter(cat => cat.length > 0);

      categories.forEach(category => {
        if (!categoryData[category]) {
          categoryData[category] = [];
        }
        categoryData[category].push(title);
      });
    }
  }
});

// Sort by count (descending) then alphabetically
const sortedCategories = Object.entries(categoryData)
  .sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return a[0].localeCompare(b[0]);
  });

console.log('\nFull Category Breakdown:\n');
sortedCategories.forEach(([category, posts]) => {
  console.log(`\n${category} (${posts.length} posts):`);
  console.log('─'.repeat(60));
  posts.forEach(post => {
    console.log(`  • ${post}`);
  });
});

console.log('\n' + '═'.repeat(60));
console.log(`Total unique categories: ${sortedCategories.length}`);
console.log(`Total blog posts analyzed: ${files.length}\n`);
