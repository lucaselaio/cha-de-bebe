import { computed, ref } from "vue";
import { giftNames, localeOptions, messages, supportedLocales } from "@/i18n/messages";

const STORAGE_KEY = "cha-de-bebe-locale";
const DEFAULT_LOCALE = "pt";

function detectInitialLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const storedLocale = window.localStorage.getItem(STORAGE_KEY);

  if (storedLocale && supportedLocales.includes(storedLocale)) {
    return storedLocale;
  }

  const browserLocale = window.navigator.language?.toLowerCase() ?? "";
  return browserLocale.startsWith("en") ? "en" : "pt";
}

function syncDocumentLanguage(locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "en" ? "en-US" : "pt-BR";
}

const activeLocale = ref(detectInitialLocale());
syncDocumentLanguage(activeLocale.value);

function resolveMessage(locale, key) {
  return key.split(".").reduce((value, segment) => value?.[segment], messages[locale]);
}

function translateKnownError(locale, message) {
  if (!message || message === "REQUEST_FAILED") {
    return resolveMessage(locale, "errors.requestFailed");
  }

  const exactMatches = {
    "Item inválido.": "errors.invalidItem",
    "Este item ainda não possui unidades selecionadas.": "errors.emptySelection",
    "Armazenamento persistente não configurado. Conecte um banco Redis na Vercel ou defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.":
      "errors.storageNotConfigured",
    "Nao foi possivel reservar o item.": "errors.reserveFailed",
    "Não foi possível reservar o item.": "errors.reserveFailed",
    "Nao foi possivel remover a reserva do item.": "errors.removeFailed",
    "Não foi possível remover a reserva do item.": "errors.removeFailed",
    "Nao foi possivel processar a solicitacao.": "errors.processFailed",
    "Não foi possível processar a solicitação.": "errors.processFailed",
    "Nao foi possivel concluir a acao.": "errors.requestFailed",
    "Não foi possível concluir a ação.": "errors.requestFailed",
    "Failed to fetch": "errors.requestFailed",
  };

  if (exactMatches[message]) {
    return resolveMessage(locale, exactMatches[message]);
  }

  const limitReachedMatch = message.match(/limite m[aá]ximo de (\d+) unidade\(s\)/i);

  if (limitReachedMatch) {
    return resolveMessage(locale, "errors.limitReached")({
      maxQuantity: limitReachedMatch[1],
    });
  }

  return message;
}

export function useI18n() {
  const locale = computed(() => activeLocale.value);

  function t(key, params = {}) {
    const message = resolveMessage(activeLocale.value, key);

    if (typeof message === "function") {
      return message(params);
    }

    return typeof message === "string" ? message : key;
  }

  function setLocale(nextLocale) {
    if (!supportedLocales.includes(nextLocale) || nextLocale === activeLocale.value) return;

    activeLocale.value = nextLocale;
    syncDocumentLanguage(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }

  function getGiftName(item) {
    return giftNames[activeLocale.value]?.[item.id] ?? item.name;
  }

  function formatDateTime(value) {
    if (!value) return t("selectedGift.noUpdate");

    return new Intl.DateTimeFormat(activeLocale.value === "en" ? "en-US" : "pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getErrorMessage(error) {
    return translateKnownError(activeLocale.value, error?.message);
  }

  return {
    locale,
    localeOptions,
    t,
    setLocale,
    getGiftName,
    formatDateTime,
    getErrorMessage,
  };
}
