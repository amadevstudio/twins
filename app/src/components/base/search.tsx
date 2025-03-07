import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { type searchUserSchema } from "@/server/api/types/user";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";

export default function SearchForm({
  form,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof searchUserSchema>>;
  onSubmit: (data: z.infer<typeof searchUserSchema>) => Promise<void>;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="
          flex w-full flex-col items-center gap-5
          md:flex-row md:items-start
        "
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="w-full md:flex-grow">
              <FormControl>
                <Input {...field} placeholder="Юрист йога фортепиано" />
              </FormControl>
              <FormDescription>
                Введите ключевые слова для поиска нужного вам человека
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit">Найти</Button>
      </form>
    </Form>
  );
}
