import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const ThemeContext = createContext({ theme: 'light', toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

const KEY = 'rei.theme'

function readTheme() {
  try {
    const saved = globalThis.localStorage && globalThis.localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      globalThis.localStorage && globalThis.localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={
        'grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-brand-soft hover:text-brand-ink ' +
        className
      }
    >
      {dark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}
