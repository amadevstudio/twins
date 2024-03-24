import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, type ProtoExtends } from "@/lib/utils";
import { type z } from "zod";
import { api } from "@/utils/api";
import { getServerSession } from "next-auth";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  queryUserSchema,
  type queryUserType,
  userSexAllowed,
} from "@/server/api/types/user";
import { authOptions } from "@/server/auth";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  addictWithDots,
  isDateBad,
  isValidDate,
  onKeyDownDotsController,
  showDate,
} from "@/utils/types/date";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/env";
import { serverSideHelper } from "@/pages/api/trpc/[trpc]";
import { Checkbox } from "@/components/ui/checkbox";
import * as entitiesI18n from "@/utils/i18n/entities/t";
import { toast } from "sonner";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import * as query from "@/utils/query/query";
import { constants } from "@/constants";
import { Progress } from "@/components/ui/progress";
import { userAvatarUrl } from "@/utils/files/uploads";
import { digUserAvatar } from "@/utils/client/pages/user/userAvatar";
import Loader from "@/components/ui/loader";

type RouterOutput = inferRouterOutputs<AppRouter>;

type TUserForm = ProtoExtends<
  queryUserType,
  {
    sex: "MALE" | "FEMALE" | undefined;
  }
>;

const prepareKeyWordsToShow = (
  userToKeyWords: { order: number; keyWord: { keyWord: string } }[] | undefined,
) => {
  if (userToKeyWords === undefined) return "";

  return userToKeyWords
    .sort((a, b) => a.order - b.order)
    .map((utkw) => utkw.keyWord.keyWord)
    .join(" ");
};

const getFormValues = (userData: RouterOutput["user"]["self"]): TUserForm => {
  return {
    name: userData?.name ?? "",
    sex:
      userData?.userInfo?.sex !== "EMPTY" &&
      userData?.userInfo?.sex &&
      userSexAllowed.includes(userData.userInfo.sex)
        ? userData.userInfo.sex
        : undefined,
    city: userData?.userInfo?.city ?? "",
    birthday: userData?.userInfo?.birthday ?? undefined,
    contacts: userData?.userInfo?.contacts ?? "",
    keyWords: prepareKeyWordsToShow(userData?.userToKeyWords),
    additionalInfo: userData?.userInfo?.additionalInfo ?? "",
    registrationTarget:
      userData?.userToRegistrationTargets?.map(
        (utrt) => utrt.registrationTarget.target,
      ) ?? [],
  };
};

function generateAvatarLink(imageId: string | undefined) {
  if (imageId === undefined) return undefined;
  return `${userAvatarUrl(imageId)}&timestamp=${new Date().getTime()}`;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  await serverSideHelper.user.self.prefetch();
  await serverSideHelper.registrationTarget.getAll.prefetch();

  return {
    props: {
      trpcState: serverSideHelper.dehydrate(),
    },
  };
}

export default function User(
  _: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { data: session } = useSession();

  const userData = api.user.self.useQuery(undefined, {
    enabled: session?.user?.id !== undefined,
    refetchOnWindowFocus: false,
  });

  // Separate query, used only for avatar
  const userWithData = api.user.selfWithAvatar.useQuery(undefined, {
    enabled: session?.user?.id !== undefined,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="container">
      <div className="flex flex-col">
        {userData.data !== undefined && (
          <>
            <ProfilePhotosShow userData={userWithData.data} />
            {/*<AdditionalPhotosShow />*/}
            <UserInfoShow userData={userData.data} className="mt-10" />
          </>
        )}
      </div>
    </div>
  );
}

function ProfilePhotosShow({
  userData,
}: {
  userData: RouterOutput["user"]["selfWithAvatar"] | undefined;
}) {
  const context = api.useUtils();
  const [editorSize, setEditorSize] = useState(250);
  useEffect(() => {
    if (window.screen.width < 400) {
      setEditorSize(150);
    }
  }, []);

  const userAvatar = digUserAvatar(userData?.userImages);

  const [avatarLink, setAvatarLink] = useState<string | undefined>(undefined);
  useEffect(() => {
    setAvatarLink(generateAvatarLink(userAvatar?.imageId));
  }, [userAvatar]);

  // Editor block properties
  const [avatar, setAvatar] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const avatarEditor = useRef<AvatarEditor>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSlowConvertingMessage, setIsSlowConvertingMessage] = useState(false);

  const acceptedImages = ["jpeg", "png", "heic"];

  async function convertHeicToJpeg(heic: File): Promise<File | null> {
    if (typeof window !== "undefined") {
      const heic2any = (await import("heic2any")).default; // Dynamic import
      return new File(
        [
          (await heic2any({
            blob: heic,
            toType: "image/jpeg",
            quality: 0.8,
          })) as Blob,
        ],
        heic.name,
      );
    }
    return null;
  }

  async function avatarDropped(dropped: File[]) {
    if (!dropped[0]) {
      setAvatar(null);
      return;
    }

    const avatar = dropped[0];
    if (!acceptedImages.map((ai) => `image/${ai}`).includes(avatar.type)) {
      toast(
        `Возможна загрузка только следующих типов: ${acceptedImages.join(", ")}`,
      );
      setAvatar(null);
      return;
    }

    setIsConverting(true);
    if (avatar.type === "image/heic") {
      const timerId = setTimeout(() => {
        setIsSlowConvertingMessage(true);
      }, 5000);

      const convertedAvatar = await convertHeicToJpeg(avatar);

      setIsSlowConvertingMessage(false);
      clearInterval(timerId);

      setAvatar(convertedAvatar);
    } else {
      setAvatar(avatar);
    }
    setIsConverting(false);
  }

  async function uploadAvatar() {
    if (!avatarEditor.current) {
      return;
    }

    const dataUrl = avatarEditor.current.getImage().toDataURL();
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const formData = new FormData();

    formData.append("image", blob);

    setUploadProgress(0);

    const response = await query
      .post("/api/files/user/uploadAvatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total === undefined) {
            return;
          }

          setUploadProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
          );
        },
      })
      .catch(function (error: query.error) {
        if (error.response) {
          if (error.response.status === 413) {
            toast(
              `Слишком большой файл, допустимо ${constants.MAX_IMAGE_SIZE_MB}Мб`,
            );
          } else if (error.response.status == 401) {
            toast("Для этого действия надо войти в аккаунт");
          } else {
            toast("Возникла ошибка, свяжитесь с поддержкой");
          }
          console.log(error.response);
        } else if (error.request) {
          toast("Возникла ошибка, свяжитесь с поддержкой");
          console.log(error.request);
        } else {
          toast("Возникла ошибка, свяжитесь с поддержкой");
          console.log(error.message);
        }
      });

    setUploadProgress(100);

    if (response === undefined) {
      return;
    }

    await context.user.selfWithAvatar.invalidate();
    setIsOpen(false);
    toast("Загружено!");
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="m-auto flex w-min cursor-pointer flex-col items-center gap-2">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarLink} alt={userData?.email ?? ""} />
              <AvatarFallback>{userData?.email?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Button>Выберите фото профиля</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          {isConverting ? (
            <>
              <div className="flex justify-center gap-2">
                <p>Конвертация heic</p>
                <Loader className="h-5 w-5" />
              </div>
              {isSlowConvertingMessage && (
                <p>
                  Это может занять продолжительное время на некоторых
                  устройствах
                </p>
              )}
            </>
          ) : (
            <>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <>
                  <DialogHeader>
                    <DialogTitle>Загрузка</DialogTitle>
                  </DialogHeader>
                  <Progress value={uploadProgress} />
                </>
              )}
              {(uploadProgress === 0 || uploadProgress === 100) && (
                <>
                  <DialogHeader>
                    <DialogTitle>Фото профиля</DialogTitle>
                    <DialogDescription>
                      Выберите и отредактируйте фото профиля. Не забудьте
                      сохранить перед выходом
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Dropzone
                      onDrop={avatarDropped}
                      noClick
                      noKeyboard
                      accept={{
                        "image/*": acceptedImages.map((ai) => `.${ai}`),
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <Label
                          {...getRootProps()}
                          htmlFor="profileUploader"
                          className="cursor-pointer border-2 p-10 text-center"
                        >
                          Нажмите или перенесите фото
                          <Input
                            {...getInputProps()}
                            id="profileUploader"
                            type="file"
                          />
                        </Label>
                      )}
                    </Dropzone>
                    {avatar && (
                      <AvatarEditorBlock
                        avatarEditor={avatarEditor}
                        avatar={avatar}
                        scale={scale}
                        setScale={setScale}
                        width={editorSize}
                      />
                    )}
                  </div>
                  {avatar && (
                    <DialogFooter>
                      <Button onClick={uploadAvatar}>Сохранить</Button>
                    </DialogFooter>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AvatarEditorBlock({
  avatarEditor,
  avatar,
  scale,
  setScale,
  width,
}: {
  avatarEditor: React.RefObject<AvatarEditor>;
  avatar: File;
  scale: number;
  setScale: (scale: number) => void;
  width?: number;
}) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <AvatarEditor
        ref={avatarEditor}
        image={avatar}
        width={width}
        height={width}
        border={50}
        color={[255, 255, 255, 0.6]}
        scale={scale}
        rotate={0}
        borderRadius={125}
        className="max-w-full"
      />
      <Slider
        onValueChange={(value) => setScale(value[0] ?? 1)}
        defaultValue={[scale]}
        min={1}
        max={2}
        step={0.05}
      />
    </div>
  );
}

// function AdditionalPhotosShow() {
//   const [photos, setPhotos] = useState<(File | null)[]>([]);
//
//   return (
//     <div>
//       <Dialog>
//         <DialogTrigger asChild>
//           <div className="flex cursor-pointer flex-col gap-2">
//             <Button>Загрузите дополнительные фото</Button>
//           </div>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Фото</DialogTitle>
//             <DialogDescription>
//               Загрузите до 5 штук. Не забудьте сохранить перед выходом
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex flex-col gap-4">
//             <Dropzone
//               onDrop={(dropped) => setPhotos(dropped)}
//               noClick
//               noKeyboard
//             >
//               {({ getRootProps, getInputProps }) => (
//                 <Label
//                   {...getRootProps()}
//                   htmlFor="profileUploader"
//                   className="cursor-pointer border-2 p-10 text-center"
//                 >
//                   Нажмите или перенесите фото
//                   <Input
//                     {...getInputProps()}
//                     id="profileUploader"
//                     type="file"
//                     multiple={true}
//                   />
//                 </Label>
//               )}
//             </Dropzone>
//             {photos.map((photo) => JSON.stringify(photo))}
//           </div>
//           <DialogFooter>
//             <Button type="submit">Сохранить</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

function UserInfoShow({
  className,
  userData,
}: {
  className: string;
  userData: RouterOutput["user"]["self"];
}) {
  const context = api.useUtils();

  const registrationTargets = api.registrationTarget.getAll.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  const updateUserSchema = queryUserSchema;

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: getFormValues(userData),
  });

  const [birthdayDirectInput, setBirthdayDirectInput] = useState(
    userData?.userInfo?.birthday ? showDate(userData.userInfo.birthday) : "",
  );

  let birthdayDirectInputBackspaceFlag = false;

  function birthdayDirectInputCallback(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.target.value.replace(/[^0-9./]/g, "");
    const augmentedInput = addictWithDots(
      input,
      birthdayDirectInputBackspaceFlag,
    );
    setBirthdayDirectInput(augmentedInput);
    const newBirthday = parse(augmentedInput, "dd.MM.yyyy", new Date());
    if (isValidDate(newBirthday) && !isDateBad(newBirthday)) {
      form.setValue("birthday", newBirthday);
      form.clearErrors();
    } else {
      form.setError("birthday", { type: "custom", message: "mem" });
    }
  }

  function birthdayDirectInputPreCallback(
    event: React.KeyboardEvent<HTMLElement>,
  ) {
    const result = onKeyDownDotsController(event.key);
    if (result.setDeleteFlag) {
      birthdayDirectInputBackspaceFlag = true;
    }
    if (result.stop) {
      return false;
    }
  }

  function birthdayCalendarOnSelect(birthday: Date | undefined) {
    setBirthdayDirectInput(showDate(birthday));
    form.clearErrors();
  }

  const userUpdateMutation = api.user.update.useMutation({
    async onSuccess() {
      await context.user.self.invalidate();
      toast("Сохранено");
    },
  });

  useEffect(() => {
    form.reset(getFormValues(userData));
  }, [form, userData]);

  function onSubmit(data: z.infer<typeof updateUserSchema>) {
    userUpdateMutation.mutate(data);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <Input {...field} placeholder="Имя или ФИО (обязательно)" />
                </FormControl>
                <FormMessage defaultError="Имя должно быть от 2 до 100 символов" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Ваш пол (обязательно)</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="MALE" />
                      </FormControl>
                      <FormLabel>Мужской</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="FEMALE" />
                      </FormControl>
                      <FormLabel>Женский</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage defaultError="Поле обязательно к заполнению" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <Input {...field} placeholder="Ваш город" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата рождения</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd.MM.y")
                        ) : (
                          <span>Дата рождения</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <Input
                      value={birthdayDirectInput}
                      onInput={birthdayDirectInputCallback}
                      onKeyDown={birthdayDirectInputPreCallback}
                      type="text"
                      pattern="\d{2}\.\d{2}\.\d{4}"
                      placeholder="Введите в формате 01.01.2000"
                    />
                    <Calendar
                      captionLayout={"dropdown-buttons"}
                      mode="single"
                      selected={field.value}
                      onSelect={(v) => {
                        birthdayCalendarOnSelect(v);
                        field.onChange(v);
                      }}
                      disabled={isDateBad}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage defaultError="Укажите правильную дату" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contacts"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Контактные данные для связи с вами, например, почта (обязательно)"
                  />
                </FormControl>
                <FormMessage defaultError="Поле обязательно к заполнению" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keyWords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ключевые слова (обязательно)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Можно ввести до ${env.NEXT_PUBLIC_MAX_KEY_WORDS} слов`}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Опишите себя с помощью ключевых слов (интересы, профессия,
                  книги, навыки, что угодно, что характеризует вас) без
                  опечаток, включая синонимы.
                  <br />
                  По указанным ключевым словам вас смогут найти люди и связаться
                  с вами по указанным вами контактам.
                </FormDescription>
                <FormMessage
                  defaultError={`Поле обязательно к заполнению, можно ввести не более ${env.NEXT_PUBLIC_MAX_KEY_WORDS} слов`}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Свободная информация о себе</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" {...field} />
                </FormControl>
                <FormMessage defaultError={`Поле обязательно к заполнению`} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationTarget"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">
                    Ваша цель (обязательно)
                  </FormLabel>
                  <FormDescription>
                    Указать в чекбоксе нужное, можно указать все или несколько
                  </FormDescription>
                </div>
                {registrationTargets.data?.map((rt) => (
                  <FormField
                    key={rt.target}
                    control={form.control}
                    name="registrationTarget"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={rt.target}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(rt.target)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, rt.target])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== rt.target,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {entitiesI18n.t("registrationTarget", rt.target)}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage defaultError="Поле обязательно к заполнению" />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={userUpdateMutation.isLoading}>
            {userUpdateMutation.isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
