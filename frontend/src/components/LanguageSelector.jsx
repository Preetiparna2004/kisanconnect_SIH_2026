import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिंदी' },
  { code: 'od', label: 'ଓ', full: 'ଓଡ଼ିଆ' },
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const current = i18n.language?.substring(0, 2) || 'en'

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-green-50 rounded-xl border border-green-100">
      <Globe className="w-3.5 h-3.5 text-green-600 shrink-0" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.full}
          className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${current === lang.code
              ? 'bg-green-700 text-white'
              : 'text-green-700 hover:bg-green-100'}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
