/**
 * Site-wide configuration
 *
 * This file contains all site metadata, author information, and configuration
 * that is used across multiple pages and layouts.
 */

export const SITE = {
  title: 'Aaron Roy',
  description: 'Experiences and learnings on product, growth, bikes and whatever else I wander into.',
  url: 'https://aaronroy.com',
  // Stable schema.org @id for the site as a WebSite entity (homepage schema)
  id: 'https://aaronroy.com/#website',
} as const;

export const AUTHOR = {
  name: 'Aaron Roy',
  legalName: 'Aaron Roy', // Used for copyright and legal purposes
  email: 'aaron@aaronroy.com',
  url: 'https://aaronroy.com',
  location: 'Brooklyn, NY',

  // Stable schema.org @id for Aaron as an entity. Referenced from every page
  // that mentions him (about ProfilePage, blog-post authors, homepage WebSite)
  // so search engines and AI answer engines resolve all mentions to one person.
  id: 'https://aaronroy.com/#person',

  // Entity facts used to build Person structured data (about page, etc.)
  image: '/images/aaron-roy.jpg', // 1000x1000 headshot; strengthens knowledge-panel eligibility
  jobTitle: 'Product Director',
  bio: 'Product leader who has spent the last decade scaling SaaS companies from early stage to $50M+ ARR through product-led growth, pricing, and AI. Currently Product Director at Manychat and co-founder and CEO of Wami.',
  // Current organizational affiliations (becomes schema.org worksFor)
  affiliations: [
    { name: 'Manychat', url: 'https://manychat.com/' },
    { name: 'Wami' },
  ],
  alumniOf: 'University of Connecticut School of Law',
  // Topical-authority signals for Knowledge Graph / answer engines
  knowsAbout: [
    'Product Management',
    'Product-Led Growth',
    'Artificial Intelligence',
    'SaaS',
    'Startups',
    '3D Printing',
    'Robotics',
  ],

  // Social profiles (for enhanced schema.org structured data)
  social: {
    twitter: 'https://twitter.com/aaronmroy',
    linkedin: 'https://linkedin.com/in/aaronmichaelroy',
    github: 'https://github.com/amr05008',
  },
} as const;
