import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { LOCALES, DEFAULT_LOCALE, dirFor } from "./config";

import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";
import enPartners from "../locales/en/partners.json";
import enPois from "../locales/en/pois.json";
import enAuth from "../locales/en/auth.json";
import enDispatch from "../locales/en/dispatch.json";
import enLedger from "../locales/en/ledger.json";
import enDrivers from "../locales/en/drivers.json";
import enMedia from "../locales/en/media.json";
import enSettings from "../locales/en/settings.json";
import enErrors from "../locales/en/errors.json";
import enNotifications from "../locales/en/notifications.json";
import enSimulator from "../locales/en/simulator.json";
import enFulfillment from "../locales/en/fulfillment.json";
import enAds from "../locales/en/ads.json";
import enReports from "../locales/en/reports.json";
import enDashboard from "../locales/en/dashboard.json";
import frCommon from "../locales/fr/common.json";
import frNav from "../locales/fr/nav.json";
import frPartners from "../locales/fr/partners.json";
import frPois from "../locales/fr/pois.json";
import frAuth from "../locales/fr/auth.json";
import frDispatch from "../locales/fr/dispatch.json";
import frLedger from "../locales/fr/ledger.json";
import frDrivers from "../locales/fr/drivers.json";
import frMedia from "../locales/fr/media.json";
import frSettings from "../locales/fr/settings.json";
import frErrors from "../locales/fr/errors.json";
import frNotifications from "../locales/fr/notifications.json";
import frSimulator from "../locales/fr/simulator.json";
import frFulfillment from "../locales/fr/fulfillment.json";
import frAds from "../locales/fr/ads.json";
import frReports from "../locales/fr/reports.json";
import frDashboard from "../locales/fr/dashboard.json";
import esCommon from "../locales/es/common.json";
import esNav from "../locales/es/nav.json";
import esPartners from "../locales/es/partners.json";
import esPois from "../locales/es/pois.json";
import esAuth from "../locales/es/auth.json";
import esDispatch from "../locales/es/dispatch.json";
import esLedger from "../locales/es/ledger.json";
import esDrivers from "../locales/es/drivers.json";
import esMedia from "../locales/es/media.json";
import esSettings from "../locales/es/settings.json";
import esErrors from "../locales/es/errors.json";
import esNotifications from "../locales/es/notifications.json";
import esSimulator from "../locales/es/simulator.json";
import esFulfillment from "../locales/es/fulfillment.json";
import esAds from "../locales/es/ads.json";
import esReports from "../locales/es/reports.json";
import esDashboard from "../locales/es/dashboard.json";
import arCommon from "../locales/ar/common.json";
import arNav from "../locales/ar/nav.json";
import arPartners from "../locales/ar/partners.json";
import arPois from "../locales/ar/pois.json";
import arAuth from "../locales/ar/auth.json";
import arDispatch from "../locales/ar/dispatch.json";
import arLedger from "../locales/ar/ledger.json";
import arDrivers from "../locales/ar/drivers.json";
import arMedia from "../locales/ar/media.json";
import arSettings from "../locales/ar/settings.json";
import arErrors from "../locales/ar/errors.json";
import arNotifications from "../locales/ar/notifications.json";
import arSimulator from "../locales/ar/simulator.json";
import arFulfillment from "../locales/ar/fulfillment.json";
import arAds from "../locales/ar/ads.json";
import arReports from "../locales/ar/reports.json";
import arDashboard from "../locales/ar/dashboard.json";

export const NAMESPACES = ["common", "nav", "partners", "pois", "auth", "dispatch", "ledger", "drivers", "media", "settings", "errors", "notifications", "simulator", "fulfillment", "ads", "reports", "dashboard"] as const;

const resources = {
  en: { common: enCommon, nav: enNav, partners: enPartners, pois: enPois, auth: enAuth, dispatch: enDispatch, ledger: enLedger, drivers: enDrivers, media: enMedia, settings: enSettings, errors: enErrors, notifications: enNotifications, simulator: enSimulator, fulfillment: enFulfillment, ads: enAds, reports: enReports, dashboard: enDashboard },
  fr: { common: frCommon, nav: frNav, partners: frPartners, pois: frPois, auth: frAuth, dispatch: frDispatch, ledger: frLedger, drivers: frDrivers, media: frMedia, settings: frSettings, errors: frErrors, notifications: frNotifications, simulator: frSimulator, fulfillment: frFulfillment, ads: frAds, reports: frReports, dashboard: frDashboard },
  es: { common: esCommon, nav: esNav, partners: esPartners, pois: esPois, auth: esAuth, dispatch: esDispatch, ledger: esLedger, drivers: esDrivers, media: esMedia, settings: esSettings, errors: esErrors, notifications: esNotifications, simulator: esSimulator, fulfillment: esFulfillment, ads: esAds, reports: esReports, dashboard: esDashboard },
  ar: { common: arCommon, nav: arNav, partners: arPartners, pois: arPois, auth: arAuth, dispatch: arDispatch, ledger: arLedger, drivers: arDrivers, media: arMedia, settings: arSettings, errors: arErrors, notifications: arNotifications, simulator: arSimulator, fulfillment: arFulfillment, ads: arAds, reports: arReports, dashboard: arDashboard },
} as const;

/** Apply <html lang> + <html dir> for the active locale. */
function applyDocumentDir(locale: string) {
  const root = document.documentElement;
  root.setAttribute("lang", locale);
  root.setAttribute("dir", dirFor(locale));
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: LOCALES as unknown as string[],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    ns: NAMESPACES as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "louka.locale",
      caches: ["localStorage"],
    },
  });

applyDocumentDir(i18n.resolvedLanguage ?? DEFAULT_LOCALE);
i18n.on("languageChanged", applyDocumentDir);

export default i18n;
