import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as entitiesI18n from "@/utils/i18n/entities/t";
import { age } from "@/utils/types/date";
import React, { useEffect } from "react";
import { api } from "@/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type UserImage } from "@prisma/client";
import { userAvatarUrl } from "@/utils/files/uploads";
import { digUserAvatar } from "@/utils/client/pages/user/userAvatar";

// TODO: user page metadata
// type Props = {
//   params: { id: string };
// };
//
// export async function generateMetadata(
//   { params }: Props,
//   _: ResolvingMetadata,
// ): Promise<Metadata> {
//   const user = (await fetch(`/api/rest/user/${params.id}`).then((res) =>
//     res.json(),
//   )) as Awaited<ReturnType<typeof userService.findById>>;
//
//   return {
//     title: `${user?.name} | ${env.NEXT_PUBLIC_PROJECT_NAME}`,
//     openGraph: {
//       title: `${user?.name} | ${env.NEXT_PUBLIC_PROJECT_NAME}`,
//       description:
//         user?.userInfo?.additionalInfo === null
//           ? undefined
//           : user?.userInfo?.additionalInfo,
//       siteName: env.NEXT_PUBLIC_PROJECT_NAME,
//     },
//   };
// }

export default function User() {
  const router = useRouter();

  const userId = String(router.query.id);
  const userQuery = api.user.findById.useQuery(userId);
  const user = userQuery.data;

  const userAvatar = digUserAvatar(user?.userImages);

  return (
    <div className="container">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {[
              user?.name,
              entitiesI18n.t("sex", user?.userInfo?.sex?.toLowerCase() ?? ""),
            ]
              .filter((ui) => ui != undefined)
              .join(", ")}
          </CardTitle>
          <CardDescription>
            {[age(user?.userInfo?.birthday ?? undefined), user?.userInfo?.city]
              .filter((ui) => ui != undefined)
              .join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-5 flex-col items-center md:flex-row md:items-start">
          <ProfilePhoto image={userAvatar} email={user?.email ?? ""} />
          <div className="flex-col p-2">
            <div>{user?.userInfo?.additionalInfo}</div>
            <div className="flex gap-2 mt-2">
              {user?.userToRegistrationTargets?.map((utrt) => (
                <Badge key={utrt.registrationTargetId}>
                  {entitiesI18n.t(
                    "registrationTarget",
                    utrt.registrationTarget.target,
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>{user?.userInfo?.contacts}</CardFooter>
      </Card>
    </div>
  );
}

function ProfilePhoto({
  image,
  email,
}: {
  image: UserImage | undefined;
  email: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-10 md:flex-row">
      <div className="flex">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={!!image ? userAvatarUrl(image?.imageId) : undefined}
            alt={email ?? ""}
          />
          <AvatarFallback>{email.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
