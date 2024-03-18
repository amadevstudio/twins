import { escapedHost, mailer } from "@/mailers/mailer";
import { color } from "@/mailers/mailer";
import { env } from "@/env";

export async function searchQuerySubscriptionCreatedMailer(
  to: string,
  searchKeyWordsString: string,
) {
  await mailer(
    to,
    "Создана подписка на поисковый запрос!",
    textCreated(searchKeyWordsString),
    htmlCreated(searchKeyWordsString),
  );
}

function htmlCreated(searchKeyWordsString: string) {
  return `
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Создана подписка на поисковый запрос "${searchKeyWordsString}" на ${escapedHost}
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Если вы не запрашивали это письмо, вы можете его проигнорировать.
      </td>
    </tr>
  `;
}

function textCreated(searchKeyWordsString: string) {
  return `Создана подписка на поисковый запрос: ${searchKeyWordsString}`;
}

export async function searchQuerySubscriptionCompletedMailer(
  to: string,
  foundUserId: string,
  searchKeyWordsString: string,
) {
  await mailer(
    to,
    "Найден пользователь по вашему поисковому запросу!",
    textCompleted(foundUserId, searchKeyWordsString),
    htmlCompleted(foundUserId, searchKeyWordsString),
  );
}

function getLinkToUser(foundUserId: string) {
  return `${env.NEXT_PUBLIC_DOMAIN}/user/${foundUserId}`;
}

function htmlCompleted(foundUserId: string, searchKeyWordsString: string) {
  const linkToUser = getLinkToUser(foundUserId);

  return `
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Найден пользователь по вашему поисковому запросу "${searchKeyWordsString}" на ${escapedHost}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${linkToUser}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                Перейти к пользователю
            </a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Если вы не запрашивали это письмо, вы можете его проигнорировать.
      </td>
    </tr>
  `;
}

function textCompleted(foundUserId: string, searchKeyWordsString: string) {
  const linkToUser = getLinkToUser(foundUserId);

  return `Найден пользователь по вашему поисковому запросу (${searchKeyWordsString}): ${linkToUser}`;
}
