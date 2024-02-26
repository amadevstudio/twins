import { env } from "@/env";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * The following errors are passed as error query parameters to the default or overridden error page.
 *
 * [Documentation](https://authjs.dev/guides/basics/pages#error-page)
 */

interface ErrorView {
  status: number;
  heading: string;
  message: JSX.Element;
  signin?: JSX.Element;
}

type ErrorPageParam = "Configuration" | "AccessDenied" | "Verification";

/** Renders an error page. */
export default function ErrorPage() {
  const url = new URL(env.NEXT_PUBLIC_DOMAIN);

  const searchParams = useSearchParams();
  const error: ErrorPageParam =
    (searchParams.get("error") as ErrorPageParam) ?? "default";

  const signinPageUrl = `${url.href}/auth/signin`;

  const errors: Record<ErrorPageParam | "default", ErrorView> = {
    default: {
      status: 200,
      heading: "Error",
      message: (
        <p>
          <Link href={url.href}>Вернуться к {url.hostname}</Link>
        </p>
      ),
    },
    Configuration: {
      status: 500,
      heading: "Server error",
      message: (
        <div>
          <p>Возникла проблема с конфигурацией сервера.</p>
          <p>
            Пожалуйста,{" "}
            <Link
              className="underline"
              href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
            >
              свяжитесь с поддержкой
            </Link>
          </p>
        </div>
      ),
    },
    AccessDenied: {
      status: 403,
      heading: "Access Denied",
      message: (
        <div>
          <p>У вас нет доступа для просмотра этой страницы</p>
        </div>
      ),
      signin: (
        <Link href={signinPageUrl}>
          <Button>Войдите</Button>
        </Link>
      ),
    },
    Verification: {
      status: 403,
      heading: "Unable to sign in",
      message: (
        <div>
          <p>Ссылка больше недействительна.</p>
          <p>
            Возможно, вы уже использовали её или истёк её срок действия.
            Попробуйте ещё раз!
          </p>
        </div>
      ),
      signin: (
        <Link href={signinPageUrl}>
          <Button>Войдите</Button>
        </Link>
      ),
    },
  };

  const { status, heading, message, signin } = errors[error] ?? errors.default;

  return (
    <div className="container flex flex-col items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-red-600">Ошибка</CardTitle>
          <CardDescription>
            {heading} {status}
          </CardDescription>
        </CardHeader>
        <CardContent>{message}</CardContent>
        <CardFooter>{signin}</CardFooter>
      </Card>
    </div>
  );
}
