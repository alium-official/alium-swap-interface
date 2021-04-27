import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import de from './locales/de'
import en from './locales/en'
import esAR from './locales/es-AR'
import esUS from './locales/es-US'
import itIT from './locales/it-IT'
import iw from './locales/iw'
import ro from './locales/ro'
import ru from './locales/ru'
import vi from './locales/vi'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'

// ['de', 'en', 'es-AR', 'es-US', 'it-IT', 'iw', 'ro', 'ru', 'vi', 'zh-CN', 'zh-TW']

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'de': { translation: de },
      'en': { translation: en },
      'es-AR': { translation: esAR },
      'es-US': { translation: esUS },
      'it-IT': { translation: itIT },
      'iw': { translation: iw },
      'ro': { translation: ro },
      'ru': { translation: ru },
      'vi': { translation: vi },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW }
    },
    lng: 'en',
    fallbackLng: 'en',
    preload: ['en'],
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    debug: process.env.NODE_ENV !== 'production'
  }, (err) => {
    console.error('i18next error:', err)
  })

export default i18n
