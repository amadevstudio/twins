export function userAvatarUrl(path: string) {
  return `/api/files/user/getAvatar?avatar=${path}`;
}
