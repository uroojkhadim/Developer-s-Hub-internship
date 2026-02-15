export const API_BASE_URL = 'https://api.socialapp.example.com';
export const TIMEOUT = 10000;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  POSTS: {
    GET_ALL: '/posts',
    CREATE: '/posts',
    LIKE: (id: string) => `/posts/${id}/like`,
    COMMENT: (id: string) => `/posts/${id}/comment`,
  },
  USERS: {
    PROFILE: (id: string) => `/users/${id}`,
    FOLLOW: (id: string) => `/users/${id}/follow`,
  },
};
