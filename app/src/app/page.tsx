'use client'

import { useThemeContext } from "@/context/theme.provider"

export default function Home() {
  const { toggleTheme, theme } = useThemeContext();

  return (
    <main className="h-screen bg-primary text-main">
      Hello From Home
      <br />
      <br />
      <button onClick={toggleTheme}>toggle</button>
    </main>
  )
}
