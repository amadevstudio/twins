import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  queryUserType,
  searchUserPageSize,
  searchUserSchema,
} from "@/server/api/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/router";
import { api, RouterOutputs } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import {
  constructSearchUrl,
  getBaseUrl,
  pageParamName,
  searchParamName,
} from "@/pages/search/helper";
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
import { age, showDate } from "@/utils/types/date";
import Link from "next/link";

export default function Home() {
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

  return (
    <div className="container flex flex-col items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center gap-5 md:flex-row"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="w-full md:flex-grow">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Введите ключевые слова для поиска нужного вам человека"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Найти</Button>
        </form>
      </Form>

      <div className="container pt-20">
        {!searchResults.data && <p>Поиск...</p>}
        {!!searchResults.data && (
          <SearchResults
            currentPage={currentPage}
            data={searchResults.data}
            baseUrl={getBaseUrl(searchQuery)}
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
}: {
  data: RouterOutputs["user"]["findByKeyWords"];
  currentPage: number;
  baseUrl: string;
}) {
  // const dataToShow = (userInfo?: queryUserType) => [userInfo?.sex, userInfo.]

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
        <p>
          Сейчас на сервисе отсутствуют люди, соответствующие данному запросу,
          однако они могут появиться уже завтра. Мы можем отправить Вам на email
          ссылку на профили таких людей, как только они зарегистрируются. Для
          этого Вам нужно Подписаться на поисковый запрос.
        </p>
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
