import { client } from '@/api/axiosClient';

/**
 * Quotable API Service
 * Provides access to inspirational quotes from Quotable API
 */

/**
 * Get a random quote from Quotable API
 *
 * Features:
 * - Requires authentication
 * - Global caching: All users share the same quote for 1 hour
 * - Cached quotes served from Redis for performance
 * - Rate limiting: 50 requests/minute (authenticated users)
 *
 * @returns {Promise} Promise with quote data
 *
 * Response format:
 * {
 *   "_id": "quote-id",
 *   "content": "Quote text",
 *   "author": "Author name",
 *   "tags": ["tag1", "tag2"],
 *   "authorSlug": "author-slug",
 *   "length": 123,
 *   "dateAdded": "2021-01-01",
 *   "dateModified": "2021-01-01"
 * }
 */
export function getRandomQuote() {
  return client.get('/analytics/quotable');
}
