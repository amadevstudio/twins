import entitiesDict from "@/utils/i18n/entities/entities-dict.json"

// TODO: use ts modules?

export function t(type: string, code: string) {
  try {
    return String(entitiesDict[type][code])
  } catch (e) {
    return `${type}.${code}`
  }
}
