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
export default function User() {
  const router = useRouter();

  const userId = String(router.query.id);
  const userQuery = api.user.findById.useQuery(userId);
  const user = userQuery.data;

  return (
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
        <ProfilePhoto email={user?.email ?? ""} />
        <div className="p-2">
          {user?.userInfo?.additionalInfo}
          <br />
          {user?.userToRegistrationTargets?.map((utrt) => (
            <Badge key={utrt.registrationTargetId}>
              {entitiesI18n.t(
                "registrationTarget",
                utrt.registrationTarget.target,
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>{user?.userInfo?.contacts}</CardFooter>
    </Card>
  );
}

function ProfilePhoto({ email }: { email: string }) {
  return (
    <div className="flex flex-col-reverse gap-10 md:flex-row">
      <div className="flex">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt={email ?? ""} />
          <AvatarFallback>{email.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
