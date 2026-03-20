import type { AppInfo } from '@/types/app'

export const APP_ID = `${process.env.NEXT_PUBLIC_APP_ID}`
export const API_KEY = `${process.env.NEXT_PUBLIC_APP_KEY}`
export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`

export const APP_INFO: AppInfo = {
  title: 'Sellinghub AI Dopisář',
  description: 'Prémiový AI asistent pro realitní makléře.', // Adds metadata for the browser
  copyright: 'Sellinghub', // This will now show up automatically in your sidebar footer!
  privacy_policy: '', // Leave blank unless you get a URL from them later
  default_language: 'en', // Keep as 'en' so it loads your custom Czech overwrites
  disable_session_same_site: false, // Leave false unless embedding in an iframe
}

export const isShowPrompt = false
export const promptTemplate = '' // Wiped out the weird javascript console default

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
