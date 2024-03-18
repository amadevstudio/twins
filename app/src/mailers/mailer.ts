import { createTransport } from "nodemailer";
import { env } from "@/env";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const provider: { server: SMTPTransport.Options; from: string } = {
  server: {
    host: env.NEXTAUTH_EMAIL_HOST,
    port: Number(env.NEXTAUTH_EMAIL_PORT),
    auth: {
      user: env.NEXTAUTH_EMAIL_USER,
      pass: env.NEXTAUTH_EMAIL_PASSWORD,
    },
    secure: true,
  },
  from: env.NEXTAUTH_EMAIL_FROM,
};

export async function mailer(
  to: string,
  subject: string,
  text: string,
  html: string,
) {
  const transport = createTransport(provider.server);
  const result = await transport.sendMail({
    to: to,
    from: provider.from,
    subject: subject,
    text: text,
    html: layouted(html),
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
  }
}

//

const url = env.NEXT_PUBLIC_DOMAIN;
const { host } = new URL(url);

export const escapedHost = host.replace(/\./g, "&#8203;.");

export const brandColor = "#101728";
export const color = {
  background: "#f9f9f9",
  text: "#000",
  mainBackground: "#fff",
  buttonBackground: brandColor,
  buttonBorder: brandColor,
  buttonText: "#fff",
};

function layouted(html: string) {
  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    ${html}
  </table>
</body>
`;
}
