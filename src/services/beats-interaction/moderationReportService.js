import { client } from '@/api/axiosClient';

/**
 * Create moderation report for a comment
 * No body required
 */
export function createCommentModerationReport(commentId) {
  return client.post(`/beats-interactions/comments/${commentId}/moderationReports`);
}

/**
 * Create moderation report for a rating
 * No body required
 */
export function createRatingModerationReport(ratingId) {
  return client.post(`/beats-interactions/ratings/${ratingId}/moderationReports`);
}

/**
 * Create moderation report for a playlist
 * No body required
 */
export function createPlaylistModerationReport(playlistId) {
  return client.post(`/beats-interactions/playlists/${playlistId}/moderationReports`);
}

/**
 * Get all moderation reports where the specified user is the reported user (authorId)
 * No pagination
 */
export function getModerationReportsByUserId(userId) {
  return client.get(`/beats-interactions/moderationReports/users/${userId}`);
}
