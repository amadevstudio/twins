import { signIn, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { Inter as FontSans } from "next/font/google";

import { Button } from "@/components/ui/button-base";
import { Input } from "@/components/ui/input-base";
import Link from "next/link";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function Home() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="container flex flex-col items-center justify-between pt-20">
      <div className="items-center w-full">
        <Input placeholder="Введите ключевые слова для поиска нужного вам человека"/>
      </div>

      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-2">
          {/*<p className="text-2xl">*/}
          {/*  {hello.data ? hello.data.greeting : "Loading tRPC query..."}*/}
          {/*</p>*/}
          <AuthShowcase/>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          className="text-center"
          target="_blank"
          href="https://google.com/search?q=agreement"
        >
          Пользовательское соглашение и политика конфиденциальности
        </Link>
      </div>
    </div>
  );
}

function AuthShowcase() {
  const {data: sessionData } = useSession();

  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user.ts !== undefined },
  // );

  const authViaGoogle = async () => {
    await signIn("google", { callbackUrl: '/user' });
  };

  const authViaEmail = async () => {
    await signIn(undefined, { callbackUrl: '/user' });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {!sessionData && (
        <>
          <p className="text-center">
            Чтобы внести свое описание в базу сервиса и позволить другим найти
            вас по
            <br />
            вашим ключевым словам, пожалуйста, войдите:
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={authViaGoogle}>Google</Button>
            <Button onClick={authViaEmail}>Почта</Button>
          </div>
        </>
      )}
    </div>
  );
}
