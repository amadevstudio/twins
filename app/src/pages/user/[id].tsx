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
import React from "react";
import { api } from "@/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {UserImage} from "@prisma/client";
import {publicUrl} from "@/utils/files/public";
import {digUserAvatar} from "@/pages/user/userAvatar";
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
        <CardContent className="flex">
          <ProfilePhoto image={userAvatar} email={user?.email ?? ""} />
          <div className="flex-col p-2">
            <div>{user?.userInfo?.additionalInfo}</div>
            <div className="flex gap-2">
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

function ProfilePhoto({ image, email }: { image: UserImage | undefined; email: string }) {
  return (
    <div className="flex flex-col-reverse gap-10 md:flex-row">
      <div className="flex">
        <Avatar className="h-32 w-32">
          <AvatarImage src={!!image ? publicUrl(image?.imageId) : undefined} alt={email ?? ""} />
          <AvatarFallback>{email.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
