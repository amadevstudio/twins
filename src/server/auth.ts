import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import EmailProvider from "next-auth/providers/email";
// import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";
import { createTransport } from "nodemailer"

import { env } from "@/env";
import { db } from "@/server/db";

import { afterCreate } from "@/server/service/user";
import {html, text} from "@/pages/api/auth/magic-link";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const prismaAdapter = PrismaAdapter(db);

async function sendVerificationRequest(params: {identifier: string; url: string; provider: {server: string; from: string }}) {
  const { identifier, url, provider } = params
  const { host } = new URL(url)
  // NOTE: You are not required to use `nodemailer`, use whatever you want.
  const transport = createTransport(provider.server)
  const result = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Войдите в ${host}`,
    text: text({ url, host }),
    html: html({ url, host }),
  })
  const failed = result.rejected.concat(result.pending).filter(Boolean)
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: {
    ...prismaAdapter,
    createUser: async (user) => {
      const createdUser = await prismaAdapter.createUser!(user);

      await afterCreate(createdUser);

      return createdUser;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  providers: [
    EmailProvider({
      server: {
        host: env.NEXTAUTH_EMAIL_HOST,
        port: env.NEXTAUTH_EMAIL_PORT,
        auth: {
          user: env.NEXTAUTH_EMAIL_USER,
          pass: env.NEXTAUTH_EMAIL_PASSWORD,
        },
        secure: true,
      },
      from: env.NEXTAUTH_EMAIL_FROM,
      sendVerificationRequest
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     username: { label: "Email", type: "email", placeholder: "e@mail.ru" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //
    //   }
    // }),
    GoogleProvider({
      clientId: env.NEXTAUTH_GOOGLE_ID,
      clientSecret: env.NEXTAUTH_GOOGLE_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
