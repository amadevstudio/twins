import { signIn, useSession } from "@/utils/auth/auth";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { searchUserSchema } from "@/server/api/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import React from "react";
import { useRouter } from "next/router";
import { constructSearchUrl } from "@/utils/client/pages/search/search";
import SearchForm from "@/components/base/search";

export default function Home() {
  const router = useRouter();

  const form = useForm<z.infer<typeof searchUserSchema>>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: {
      query: "",
      page: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof searchUserSchema>) {
    await router.push(constructSearchUrl(data));
  }

  return (
    <div className="container flex flex-col items-center justify-between pt-20">
      <SearchForm form={form} onSubmit={onSubmit} />

      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-2">
          <AuthShowcase />
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          className="text-center"
          target="_blank"
          href="/docs/agreement_and_confidentiality.pdf"
        >
          Пользовательское соглашение и политика конфиденциальности
        </Link>
      </div>
    </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const authViaGoogle = async () => {
    await signIn("google");
  };

  const authViaEmail = async () => {
    await signIn(undefined);
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
