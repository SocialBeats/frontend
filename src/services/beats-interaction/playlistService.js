import { client } from '@/api/axiosClient';

export function createPlaylist(data) {
  return client.post('/playlists', data)
}

export function getMyPlaylists() {
  return client.get('/playlists/me')
}

export function getUserPlaylists(userId) {
  return client.get(`/playlists/user/${userId}`)
}

export function getPublicPlaylists() {
  return client.get('/playlists/public')
}

export function getPlaylistById(id) {
  return client.get(`/playlists/${id}`)
}

export function updatePlaylist(id, data) {
  return client.patch(`/playlists/${id}`, data)
}

export function deletePlaylist(id) {
  return client.delete(`/playlists/${id}`)
}

export function addBeatToPlaylist(id, data) {
  return client.post(`/playlists/${id}/items`, data)
}

export function removeBeatFromPlaylist(playlistId, beatId) {
  return client.delete(`/playlists/${playlistId}/items/${beatId}`)
}