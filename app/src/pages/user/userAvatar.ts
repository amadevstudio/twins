import { UserImage } from "@prisma/client";

export function digUserAvatar(userImages: UserImage[] | undefined) {
  return (
    userImages
      ?.filter((image) => image.isAvatar)
      // Sort from old to new and take first (oldest)
      ?.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0]
  );
}
