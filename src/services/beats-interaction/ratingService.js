import { client } from '@/api/axiosClient';

/**
 * Create rating on a beat
 * body: { score: number, comment?: string }
 */
export function createBeatRating(beatId, data) {
  return client.post(`/beats-interactions/beats/${beatId}/ratings`, data);
}

/**
 * Create rating on a playlist
 * body: { score: number, comment?: string }
 */
export function createPlaylistRating(playlistId, data) {
  return client.post(`/beats-interactions/playlists/${playlistId}/ratings`, data);
}

/**
 * Get rating by id
 */
export function getRatingById(ratingId) {
  return client.get(`/beats-interactions/ratings/${ratingId}`);
}

/**
 * Get current user's rating for a beat
 */
export function getMyBeatRating(beatId) {
  return client.get(`/beats-interactions/beats/${beatId}/ratings/me`);
}

/**
 * Get current user's rating for a playlist
 */
export function getMyPlaylistRating(playlistId) {
  return client.get(`/beats-interactions/playlists/${playlistId}/ratings/me`);
}

/**
 * List ratings of a beat
 * Response shape:
 * {
 *   data: Array<{ userId: string, score: number, comment?: string }>,
 *   average: number,
 *   count: number
 * }
 */
export function getBeatRatings(beatId, { page = 1, limit = 5 } = {}) {
  return client.get(`/beats-interactions/beats/${beatId}/ratings`, {
    params: { page, limit },
  });
}

/**
 * List ratings of a playlist
 * Response shape:
 * {
 *   data: Array<{ userId: string, score: number, comment?: string }>,
 *   average: number,
 *   count: number
 * }
 */
export function getPlaylistRatings(playlistId, { page = 1, limit = 5 } = {}) {
  return client.get(`/beats-interactions/playlists/${playlistId}/ratings`, {
    params: { page, limit },
  });
}

/**
 * Delete a rating
 */
export function deleteRating(ratingId) {
  return client.delete(`/beats-interactions/ratings/${ratingId}`);
}

/**
 * Update rating (PUT – replaces score/comment)
 * body: { score: number, comment?: string }
 */
export function updateRating(ratingId, data) {
  return client.put(`/beats-interactions/ratings/${ratingId}`, data);
}

/**
 * Partially update rating (PATCH)
 * body: { score?: number, comment?: string }
 */
export function patchRating(ratingId, data) {
  return client.patch(`/beats-interactions/ratings/${ratingId}`, data);
}
