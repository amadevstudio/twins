import { useForm } from "react-hook-form";
import { type z } from "zod";
import {
  searchUserPageSize,
  searchUserSchema,
} from "@/server/api/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { useSearchParams } from "next/navigation";
import {
  constructSearchUrl,
  getBaseUrl,
  pageParamName,
  searchParamName,
} from "@/utils/view/search/helper";
import PaginationConstructor from "@/components/base/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import Link from "next/link";
import SearchForm from "@/components/base/search";
import { signIn, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export default function Search() {
  const { data: session } = useSession();

  const router = useRouter();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get(searchParamName) ?? "";
  const currentPage =
    searchParams.get(pageParamName) === null
      ? 1
      : Number(searchParams.get(pageParamName));

  const form = useForm<z.infer<typeof searchUserSchema>>({
    resolver: zodResolver(searchUserSchema),
    values: {
      query: searchQuery,
      page: currentPage,
    },
  });

  async function onSubmit(data: z.infer<typeof searchUserSchema>) {
    await router.push(constructSearchUrl(data));
  }

  const searchResults = api.user.findByKeyWords.useQuery(
    {
      query: searchQuery,
      page: currentPage,
    },
    { keepPreviousData: true },
  );

  const [subscribedOnSearchQuery, setSubscribedOnSearchQuery] = useState(false);

  const isSubscribedResult = api.searchQuerySubscription.findByQuery.useQuery(searchQuery);

  useEffect(() => {
    if (isSubscribedResult.data !== undefined) {
      setSubscribedOnSearchQuery(isSubscribedResult.data !== null);
    }
  }, [isSubscribedResult.data])

  const searchSubscriptionMutation =
    api.searchQuerySubscription.subscribe.useMutation({
      onSuccess: (_) => {
        setSubscribedOnSearchQuery(true);
        toast("Вы подписаны на запрос!");
      },
      onError: (error) => {
        console.error(error);
        toast("Возникла ошибка");
      },
    });

  function subscribeOnSearchQuery() {
    searchSubscriptionMutation.mutate(searchQuery);
  }

  return (
    <div className="container flex flex-col items-center">
      <SearchForm form={form} onSubmit={onSubmit} />

      <div className="container pt-20">
        {!searchResults.data && <p>Поиск...</p>}
        {!!searchResults.data && (
          <SearchResults
            currentPage={currentPage}
            data={searchResults.data}
            baseUrl={getBaseUrl(searchQuery)}
            subscribeOnSearchQuery={subscribeOnSearchQuery}
            userLogged={session?.user !== undefined}
            subscribedOnSearchQuery={subscribedOnSearchQuery}
          />
        )}
      </div>
    </div>
  );
}

function SearchResults({
  data,
  currentPage,
  baseUrl,
  subscribeOnSearchQuery,
  userLogged,
  subscribedOnSearchQuery,
}: {
  data: RouterOutputs["user"]["findByKeyWords"];
  currentPage: number;
  baseUrl: string;
  subscribeOnSearchQuery: () => void;
  userLogged: boolean;
  subscribedOnSearchQuery: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-5">
        {data.results.length > 0 &&
          data.results.map(
            (user) =>
              !!user && (
                <Link key={user.id} href={`/user/${user.id}`}>
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>
                        {[
                          user.name,
                          entitiesI18n.t(
                            "sex",
                            user.userInfo?.sex?.toLowerCase() ?? "",
                          ),
                        ]
                          .filter((ui) => ui != undefined)
                          .join(", ")}
                      </CardTitle>
                      <CardDescription>
                        {[
                          age(user.userInfo?.birthday ?? undefined),
                          user.userInfo?.city,
                        ]
                          .filter((ui) => ui != undefined)
                          .join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex">
                      <ProfilePhoto email={user.email ?? ""} />
                      <div className="p-2">{user.userInfo?.additionalInfo}</div>
                    </CardContent>
                    <CardFooter>{user.userInfo?.contacts}</CardFooter>
                  </Card>
                </Link>
              ),
          )}
      </div>

      {data.pagination.total == 0 && (
        <div className="flex flex-col items-center gap-10">
          <div>
            Сейчас на сервисе отсутствуют люди, соответствующие данному запросу,
            однако они могут появиться уже завтра. Мы можем отправить Вам на
            email ссылку на профили таких людей, как только они
            зарегистрируются.{" "}
            <p
              className={cn(
                "inline",
                userLogged && !subscribedOnSearchQuery
                  ? "cursor-pointer underline"
                  : "",
              )}
              onClick={subscribeOnSearchQuery}
            >
              Для этого Вам нужно Подписаться на поисковый запрос.
            </p>
          </div>
          {userLogged && subscribedOnSearchQuery && (
            <p>Вы подписаны на запрос</p>
          )}
          {userLogged && !subscribedOnSearchQuery && (
            <Button className="w-min" onClick={subscribeOnSearchQuery}>
              Подписаться на поисковый запрос
            </Button>
          )}
          {!userLogged && (
            <div className="flex items-center gap-2">
              <p>Чтобы подписаться на поисковый запрос, вам необходимо</p>
              <Button
                className=""
                onClick={() => signIn(undefined, { callbackUrl: "/user" })}
              >
                Войти или создать аккаунт
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="pt-5">
        <PaginationConstructor
          total={data.pagination.total}
          currentPage={currentPage}
          perPage={searchUserPageSize}
          baseUrl={baseUrl}
          pageParamName={pageParamName}
        />
      </div>
    </>
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
