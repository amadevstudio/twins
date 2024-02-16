import * as registrationTarget from "@/server/repository/registrationTarget"

export async function getAll() {
  return registrationTarget.getAll();
}
