# ADR 002: Vercel Analytics vs Google Analytics

**Date**: 2025-10-06
**Status**: Accepted
**Related session**: [2025-10-06-production-deployment](../sessions/2025-10-06-production-deployment.md)

## Context

The site needed analytics to track traffic and user behavior. Main options considered:

1. **Google Analytics (GA4)**: Industry standard, free, comprehensive
2. **Vercel Analytics**: Native Vercel integration, privacy-focused
3. **Plausible/Fathom**: Privacy-focused third-party alternatives

## Decision

Use Vercel Analytics via the official `@vercel/analytics` package.

## Rationale

**Why Vercel Analytics:**

- **No cookie consent needed**: Privacy-friendly by design, doesn't use cookies for tracking
- **Zero configuration**: Works immediately when deployed to Vercel
- **Core Web Vitals built-in**: Automatic performance monitoring without extra setup
- **Seamless integration**: Official Astro component (`@vercel/analytics/astro`)
- **Single vendor**: Analytics in same dashboard as deployment, logs, and domains

**Why not Google Analytics:**

- Requires cookie consent banner (GDPR/CCPA compliance complexity)
- More data than needed for a personal blog
- Separate dashboard to check
- Privacy concerns for visitors

**Why not Plausible/Fathom:**

- Additional monthly cost ($9+/month)
- Another vendor relationship to manage
- Vercel Analytics covers the use case adequately

## Implementation

```astro
// src/layouts/BaseLayout.astro
import { Analytics } from '@vercel/analytics/astro';

// In <body>:
<Analytics />
```

No configuration needed. Analytics automatically enabled when deployed to Vercel.

## Consequences

- Analytics only work on Vercel-hosted deployments (acceptable for this project)
- Less granular data than GA4 (sufficient for personal blog)
- No cookie banner needed
- Dashboard at vercel.com/[project]/analytics
