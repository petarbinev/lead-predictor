const translations = {
  en: {
    title: "LeadPredictor — Plan your next campaign",
    home: "LeadPredictor home",
    skip: "Skip to results",
    headerNote: "A little clarity. A better campaign.",
    setup: "Campaign setup",
    language: "Language",
    currency: "Currency",
    usd: "$ USD",
    eur: "€ EUR",
    currencyNote: "Changes the unit, not the entered amounts.",
    start: "Campaign start",
    end: "Campaign end",
    revenue: "Total revenue goal",
    order: "Average order value",
    setupFoot: "Start with your goal. We’ll work backwards.",
    overview: "THE BIG PICTURE",
    projection: "Your path to revenue",
    live: "Live estimate",
    prospects: "Prospects",
    leads: "Leads",
    customers: "Customers",
    chartLoading: "Your campaign timeline will appear here.",
    chartNote: "Cumulative targets, assuming steady progress.",
    viewData: "View monthly figures",
    tableCaption: "Cumulative campaign targets",
    period: "Period",
    month: "Month",
    people: "People",
    prospectsDescription: "People to reach",
    leadsDescription: "Interested prospects",
    customersDescription: "Orders to reach your goal",
    shareNote: "Percentages are a share of all prospects.",
    rates: "Fine-tune your funnel",
    ratesHint: "Small changes. A different outlook.",
    leadRate: "Lead response rate",
    leadRateDescription: "Leads that become customers",
    prospectRate: "Prospect response rate",
    prospectRateDescription: "Prospects that become leads",
    footer: "A clear target is a good place to start.",
    footerType: "Campaign planning",
    chartLegend: "Chart legend",
    campaignTargets: "Campaign targets",
    chartLabel: "Cumulative campaign targets",
    chartInvalid: "Complete the campaign details to see your timeline.",
    goal: "goal",
    monthOne: "month",
    monthMany: "months",
    days: "days",
    invalidRevenue: "Enter a nonnegative amount with up to 2 decimal places.",
    invalidOrder:
      "Enter an order value greater than zero, with up to 2 decimals.",
    invalidRate: "Choose a whole percentage between 1 and 100.",
    invalidDate: "Choose a valid date.",
    invalidDateOrder: "The end date must be after the start date.",
    campaignTooLong: "Choose a campaign of 10 years or less.",
    tooLarge:
      "This target is too large. Lower the revenue or increase the response rates.",
    errorSummary: "Check the highlighted fields to see your campaign estimate.",
  },
  bg: {
    title: "LeadPredictor — Планирайте следващата си кампания",
    home: "LeadPredictor — начало",
    skip: "Към резултатите",
    headerNote: "Повече яснота. По-добра кампания.",
    setup: "Настройки на кампанията",
    language: "Език",
    currency: "Валута",
    usd: "$ USD",
    eur: "€ EUR",
    currencyNote: "Сменя валутата, без да преизчислява сумите.",
    start: "Начало на кампанията",
    end: "Край на кампанията",
    revenue: "Целеви оборот",
    order: "Средна стойност на поръчка",
    setupFoot: "Започнете от целта. Ние ще изчислим стъпките.",
    overview: "ОБЩ ПОГЛЕД",
    projection: "Вашият път към целта",
    live: "Текуща прогноза",
    prospects: "Контакти",
    leads: "Лийдове",
    customers: "Клиенти",
    chartLoading: "Тук ще се появи графикът на кампанията.",
    chartNote: "Натрупващи се цели при равномерен напредък.",
    viewData: "Вижте месечните стойности",
    tableCaption: "Натрупващи се цели на кампанията",
    period: "Период",
    month: "Месец",
    people: "Хора",
    prospectsDescription: "Хора, с които да се свържете",
    leadsDescription: "Потенциални клиенти",
    customersDescription: "Поръчки за постигане на целта",
    shareNote: "Процентите са дял от всички контакти.",
    rates: "Настройте реализацията",
    ratesHint: "Малки промени. Различен резултат.",
    leadRate: "Отговори от лийдове",
    leadRateDescription: "Лийдове, които стават клиенти",
    prospectRate: "Отговори от контакти",
    prospectRateDescription: "Контакти, които стават лийдове",
    footer: "Ясната цел е добро начало.",
    footerType: "Планиране на кампании",
    chartLegend: "Легенда на графиката",
    campaignTargets: "Цели на кампанията",
    chartLabel: "Натрупващи се цели на кампанията",
    chartInvalid: "Попълнете данните, за да видите графика.",
    goal: "цел",
    monthOne: "месец",
    monthMany: "месеца",
    days: "дни",
    invalidRevenue:
      "Въведете неотрицателна сума с до 2 знака след десетичния разделител.",
    invalidOrder:
      "Въведете сума над нула с до 2 знака след десетичния разделител.",
    invalidRate: "Изберете цял процент между 1 и 100.",
    invalidDate: "Изберете валидна дата.",
    invalidDateOrder: "Крайната дата трябва да е след началната.",
    campaignTooLong: "Изберете кампания с продължителност до 10 години.",
    tooLarge:
      "Целта е твърде голяма. Намалете оборота или увеличете процента на отговорите.",
    errorSummary: "Проверете маркираните полета, за да видите прогнозата.",
  },
};

export function translator(language = "en") {
  const code = Object.hasOwn(translations, language) ? language : "en";
  const locale = code === "bg" ? "bg-BG" : "en-US";
  const t = (key) => translations[code][key] ?? translations.en[key] ?? key;
  return { code, locale, t, labels: translations[code] };
}

export function translatePage(language) {
  const translation = translator(language);
  document.documentElement.lang = translation.code;
  document.title = translation.t("title");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translation.t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", translation.t(element.dataset.i18nAria));
  });
  return translation;
}
