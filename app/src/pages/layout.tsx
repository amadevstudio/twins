import React from "react";
import Head from "next/head";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import Header from "@/components/base/header";
import { Toaster } from "@/components/ui/sonner";
import { Roboto } from "next/font/google";
import { Metadata } from "next";

export const projectFont = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "auto",
});

const metadata = {
  openGraph: {
    title: env.NEXT_PUBLIC_PROJECT_NAME,
    description: "Поиск людей по ключевым словам",
    // url: ,
    siteName: env.NEXT_PUBLIC_PROJECT_NAME,
    locale: "ru_RU",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{env.NEXT_PUBLIC_PROJECT_NAME}</title>
        <meta name="description" content={metadata.openGraph.description} />

        <meta property="og:title" content={metadata.openGraph?.title?.toString()} />
        <meta property="og:description" content={metadata.openGraph?.description?.toString()} />
        <meta property="og:siteName" content={metadata.openGraph?.siteName?.toString()} />
        <meta property="og:locale" content={metadata.openGraph?.locale?.toString()} />
        <meta property="og:type" content={metadata.openGraph?.type?.toString()} />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={cn(
          "flex min-h-screen flex-col pb-10",
          projectFont.className,
        )}
      >
        <Header />

        <div className="flex flex-1">{children}</div>

        <Toaster />
      </main>
    </>
  );
}
