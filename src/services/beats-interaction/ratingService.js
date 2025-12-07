import { client } from '@/api/axiosClient';

/**
 * Create rating on a beat
 * body: { score: number, comment?: string }
 */
export function createBeatRating(beatId, data) {
  return client.post(`/beats/${beatId}/ratings`, data);
}

/**
 * Create rating on a playlist
 * body: { score: number, comment?: string }
 */
export function createPlaylistRating(playlistId, data) {
  return client.post(`/playlists/${playlistId}/ratings`, data);
}

/**
 * Get rating by id
 */
export function getRatingById(ratingId) {
  return client.get(`/ratings/${ratingId}`);
}

/**
 * Get current user's rating for a beat
 */
export function getMyBeatRating(beatId) {
  return client.get(`/beats/${beatId}/ratings/me`);
}

/**
 * Get current user's rating for a playlist
 */
export function getMyPlaylistRating(playlistId) {
  return client.get(`/playlists/${playlistId}/ratings/me`);
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
export function getBeatRatings(beatId) {
  return client.get(`/beats/${beatId}/ratings`);
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
export function getPlaylistRatings(playlistId) {
  return client.get(`/playlists/${playlistId}/ratings`);
}

/**
 * Delete a rating
 */
export function deleteRating(ratingId) {
  return client.delete(`/ratings/${ratingId}`);
}

/**
 * Update rating (PUT – replaces score/comment)
 * body: { score: number, comment?: string }
 */
export function updateRating(ratingId, data) {
  return client.put(`/ratings/${ratingId}`, data);
}

/**
 * Partially update rating (PATCH)
 * body: { score?: number, comment?: string }
 */
export function patchRating(ratingId, data) {
  return client.patch(`/ratings/${ratingId}`, data);
}
