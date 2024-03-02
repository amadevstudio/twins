import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="container flex flex-col items-center justify-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-green-600">Успех!</CardTitle>
          <CardDescription>Ссылка для входа была отправлена на ваш почтовый ящик</CardDescription>
        </CardHeader>
        <CardContent>
          Перейдите по ней, чтобы авторизоваться. Эту вкладку можно закрыть
        </CardContent>
      </Card>
    </div>
  );
}
