// import entitiesDict from "@/utils/i18n/entities/entities-dict.json"
// TODO: fix json import

// TODO: use ts modules?

// TODO: nextjs i18n?

const entitiesDict: Record<string, Record<string, string>> = {
  sex: {
    male: "Мужской",
    female: "Женский",
  },
  registrationTarget: {
    business: "Бизнес/деловой нетворкинг",
    friendship: "Дружба",
    relationship: "Семья (отношения)",
    traveling: "Путешествия",
    communication: "Общение",
  },
};

export function t(type: string, code: string) {
  try {
    const entityMap = entitiesDict[type]
    if (entityMap === undefined) `${type}.${code}`

    return entityMap![code];
  } catch (e) {
    return `${type}.${code}`;
  }
}
