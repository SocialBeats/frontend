import { client } from '@/api/axiosClient';

export function register(userData) {
  return client.post('/auth/register', {
    username: userData.username,
    email: userData.email,
    password: userData.password,
  }).then(response => response.data);
}
