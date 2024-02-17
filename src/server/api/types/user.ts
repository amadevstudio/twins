import { z } from "zod";

export const userNameSchema = z.string().min(2).max(100);

export const userSexAllowed = ["MALE", "FEMALE"] as const;
export const userSexSchema = z.enum(userSexAllowed);

export const citySchema = z.string().optional();

export const birthdaySchema = z.date().optional();

export const contactsSchema = z.string().min(1);

export const keyWordsSchema = z.string().min(1);

export const additionalInfoSchema = z.string().optional();

// const registrationTargets: string[] = (await registrationTarget.getAll()).map(
//   (t) => {
//     return t.target;
//   },
// );
// export const registrationTargetSchema = z.nativeEnum(
//   strEnum(registrationTargets),
// );
export const registrationTargetSchema = z.array(z.string()).min(1);

export const queryUserSchema = z.object({
  name: userNameSchema,
  sex: userSexSchema,
  city: citySchema,
  birthday: birthdaySchema,
  contacts: contactsSchema,
  keyWords: keyWordsSchema,
  additionalInfo: additionalInfoSchema,
  registrationTarget: registrationTargetSchema
});

export type queryUserType = z.infer<typeof queryUserSchema>;

//

export const keyWordsSearchSchema = z.string()

export const searchUserPageSize = 10;

export const searchUserPageSchema = z.union(
  [z.number().int().positive().min(1), z.nan()]).optional()

export const searchUserSchema = z.object({
  query: keyWordsSearchSchema,
  page: searchUserPageSchema
})

export type searchUserType = z.infer<typeof searchUserSchema>


