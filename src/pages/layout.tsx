import React from "react";
import Head from "next/head";
import {env} from "@/env";
import {cn} from "@/lib/utils";
import Header from "@/components/base/header";
import {fontSans} from "@/pages/index";

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <title>{env.NEXT_PUBLIC_PROJECT_NAME}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={cn(
          "min-h-screen pb-10 flex flex-col",
          fontSans.variable,
        )}
      >
        <Header/>

        <div className="flex flex-1">
          {children}
        </div>
      </main>
    </>
  )
}
