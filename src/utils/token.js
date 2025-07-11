export function setAccessTokenToCookie(token) {
  document.cookie = `accessToken=${token}; path=/; max-age=36000; SameSite=Lax`;
}
