import { client } from '@/api/axiosClient';

/**
 * Create comment on a beat
 * body: { text: string }
 */
export function createBeatComment(beatId, data) {
  return client.post(`/beats/${beatId}/comments`, data);
}

/**
 * Create comment on a playlist
 * body: { text: string }
 */
export function createPlaylistComment(playlistId, data) {
  return client.post(`/playlists/${playlistId}/comments`, data);
}

/**
 * Get comment by id
 */
export function getCommentById(commentId) {
  return client.get(`/comments/${commentId}`);
}

/**
 * List comments of a beat (paginated)
 * options: { page?, limit? }
 */
export function getBeatComments(beatId, options = {}) {
  const params = {};

  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;

  return client.get(`/beats/${beatId}/comments`, { params });
}

/**
 * List comments of a playlist (paginated)
 * options: { page?, limit? }
 */
export function getPlaylistComments(playlistId, options = {}) {
  const params = {};

  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;

  return client.get(`/playlists/${playlistId}/comments`, { params });
}

/**
 * Delete a comment
 */
export function deleteComment(commentId) {
  return client.delete(`/comments/${commentId}`);
}

/**
 * Update comment (PUT – replaces the text)
 * body: { text: string }
 */
export function updateComment(commentId, data) {
  return client.put(`/comments/${commentId}`, data);
}

/**
 * Partially update comment (PATCH)
 * body: { text: string }
 */
export function patchComment(commentId, data) {
  return client.patch(`/comments/${commentId}`, data);
}
