import { signIn, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { Inter as FontSans } from "next/font/google";

import { Button } from "@/components/ui/button-base";
import { Input } from "@/components/ui/input-base";
import Link from "next/link";
import {searchUserSchema, searchUserType} from "@/server/api/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import React from "react";
import {redirect} from "next/navigation";
import {useRouter} from "next/router";
import {constructSearchUrl} from "@/pages/search/helper";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function Home() {
  const router = useRouter()

  const form = useForm<z.infer<typeof searchUserSchema>>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: {
      query: "",
      page: undefined
    }
  });

  async function onSubmit(data: z.infer<typeof searchUserSchema>) {
    await router.push(constructSearchUrl(data))
  }

  return (
    <div className="container flex flex-col items-center justify-between pt-20">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col md:flex-row gap-5 items-center"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="md:flex-grow w-full">
                <FormControl>
                  <Input {...field} placeholder="Введите ключевые слова для поиска нужного вам человека" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Найти</Button>
        </form>
      </Form>

      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-2">
          <AuthShowcase />
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
  const { data: sessionData } = useSession();

  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user.ts !== undefined },
  // );

  const authViaGoogle = async () => {
    await signIn("google", { callbackUrl: "/user" });
  };

  const authViaEmail = async () => {
    await signIn(undefined, { callbackUrl: "/user" });
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
