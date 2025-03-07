import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, signIn } from "@/utils/auth/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import type { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, query } = context;
  const session = await getSession({ req });
  const { callbackUrl } = query;
  if (session) {
    return {
      redirect: {
        destination: callbackUrl,
      },
    };
  }

  return {
    props: {
      callbackUrl,
    },
  };
}

export default function SignIn() {
  const providers = [
    {
      name: "google",
      displayName: "Google",
      icon: "/images/icons/g_google.png",
    },
  ];

  const loginUserSchema = z.object({
    email: z.string().min(1).email(),
  });

  const form = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: { email: "" },
  });

  const loginViaProvider = async (provider: { name: string; id?: string }) => {
    if (provider.name == "email") {
      await signIn(provider.name, { email: provider.id });
      return;
    }

    await signIn(provider.name);
  };

  return (
    <div className="container flex flex-col items-center justify-center gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            loginViaProvider({ name: "email", id: data.email }),
          )}
        >
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="email@example.ru" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Войти или создать аккаунт</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      <p>Или</p>
      <div className="flex flex-col">
        {providers.map((provider) => {
          return (
            <Button
              key={provider.name}
              className="flex gap-2"
              onClick={(_) => loginViaProvider(provider)}
            >
              <Image
                src={provider.icon}
                alt={provider.name}
                width={20}
                height={20}
              />
              <div className="text-lg">{provider.displayName}</div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
