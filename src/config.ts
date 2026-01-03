/**
 * Site-wide configuration
 *
 * This file contains all site metadata, author information, and configuration
 * that is used across multiple pages and layouts.
 */

export const SITE = {
  title: 'Aaron Roy',
  description: 'Writing on building products, bikes, and random projects.',
  url: 'https://aaronroy.com',
} as const;

export const AUTHOR = {
  name: 'Aaron Roy',
  legalName: 'Aaron Roy', // Used for copyright and legal purposes
  email: 'aaron@aaronroy.com',
  url: 'https://aaronroy.com',
  location: 'Brooklyn, NY',

  // Social profiles (for enhanced schema.org structured data)
  social: {
    twitter: 'https://twitter.com/aaronmroy',
    linkedin: 'https://linkedin.com/in/aaronmichaelroy',
    github: 'https://github.com/amr05008',
  },
} as const;
