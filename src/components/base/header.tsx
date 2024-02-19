import { env } from "@/env";
import { Button } from "@/components/ui/button-base";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: sessionData } = useSession();

  return (
    <header className="container bg-white">
      <nav
        className="mx-auto flex max-w-7xl flex-col items-center justify-between p-6 md:flex-row lg:px-8"
        aria-label="Global"
      >
        <Link href="/" className="sm:text-center">
          <span className="sr-only">{env.NEXT_PUBLIC_PROJECT_NAME}</span>
          <img
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt=""
          />
        </Link>
        <div className="flex max-w-full flex-1 flex-wrap justify-center gap-2 md:justify-end">
          {!!sessionData && (
            <>
              <Link href="/">
                <Button>На главную</Button>
              </Link>
              <Link href="/user">
                <Button>Личный кабинет</Button>
              </Link>
            </>
          )}
          <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            <Button>Написать в поддержку</Button>
          </Link>
          {!sessionData && (
            <Button onClick={() => signIn(undefined, { callbackUrl: "/user" })}>
              Войти
            </Button>
          )}
          {!!sessionData && <Button onClick={() => signOut()}>Выйти</Button>}
        </div>
      </nav>
    </header>
  );
}
