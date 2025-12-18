import { client } from '@/api/axiosClient';

export function createPlaylist(data) {
  return client.post('/beats-interactions/playlists', data)
}

export function getMyPlaylists() {
  return client.get('/beats-interactions/playlists/me')
}

export function getUserPlaylists(userId) {
  return client.get(`/beats-interactions/playlists/user/${userId}`)
}

export function getPublicPlaylists() {
  return client.get('/beats-interactions/playlists/public')
}

export function getPlaylistById(id) {
  return client.get(`/beats-interactions/playlists/${id}`)
}

export function updatePlaylist(id, data) {
  return client.patch(`/beats-interactions/playlists/${id}`, data)
}

export function deletePlaylist(id) {
  return client.delete(`/beats-interactions/playlists/${id}`)
}

export function addBeatToPlaylist(id, data) {
  return client.post(`/beats-interactions/playlists/${id}/items`, data)
}

export function removeBeatFromPlaylist(playlistId, beatId) {
  return client.delete(`/beats-interactions/playlists/${playlistId}/items/${beatId}`)
}