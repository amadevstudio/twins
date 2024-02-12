import { env } from "@/env";
import { Button } from "@/components/ui/button-base";
import {signIn, signOut, useSession} from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: sessionData } = useSession();

  return (
    <header className="container bg-white">
      <nav
        className="mx-auto flex flex-col md:flex-row max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="sm:text-center">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">{env.NEXT_PUBLIC_PROJECT_NAME}</span>
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt=""
            />
          </a>
        </div>
        <div className="gap-2 flex flex-1 justify-end">
          <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            <Button>Написать в поддержку</Button>
          </Link>
          {!sessionData &&
            <Button onClick={() => signIn()}>Войти</Button>
          }
          {!!sessionData &&
              <Button onClick={() => signOut()}>Выйти</Button>
          }
        </div>
      </nav>
    </header>
  );
}
