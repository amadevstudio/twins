import { Input } from "@/components/ui/input-base";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { api } from "@/utils/api";
import { Session } from "next-auth";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import {updateUserSchema} from "@/server/api/routers/userRouter";

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export default function User() {
  const { data: sessionData } = useSession();

  const user = api.user.self.useQuery(undefined, {
    enabled: sessionData?.user?.id !== undefined,
  });

  return (
    <div className="container">
      <div className="flex flex-col">
        {user !== undefined && (
          <>
            <ProfilePhotosShow sessionData={sessionData} />
            <UserInfoShow userData={user.data!} className="mt-10" />
          </>
        )}
      </div>
    </div>
  );
}

function ProfilePhotosShow({ sessionData }: { sessionData: Session | null }) {
  return (
    <div className="flex flex-col-reverse gap-10 pt-20 md:flex-row">
      <div className="flex flex-col">
        <Label htmlFor="profileUploader">Загрузите до 5 своих фотографий</Label>
        <Input id="profileUploader" type="file" className="flex-1" />
      </div>
      <div className="flex">
        <Avatar className="h-16 w-16">
          <AvatarImage src="" alt={sessionData?.user?.email ?? ""} />
          <AvatarFallback>
            {sessionData?.user?.email?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

function UserInfoShow({
  className,
  userData,
}: {
  className: string;
  userData: RouterOutput["user"]["self"];
}) {
  // TODO
  // updateUserSchema
  // const formSchema = RouterInput["user"]["update"];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Input placeholder="Имя или ФИО (обязательно)" defaultValue={userData?.name ?? ""} />
      <RadioGroup defaultValue="comfortable">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="r1" />
          <Label htmlFor="r1">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="comfortable" id="r2" />
          <Label htmlFor="r2">Comfortable</Label>
        </div>
      </RadioGroup>
      <Input placeholder="" />
      <Input placeholder="" />
      <Input placeholder="" />
      <Input placeholder="" />
      <Input placeholder="" />
    </div>
  );
}
