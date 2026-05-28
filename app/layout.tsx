import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FanBridge AI — AI球迷经纪人助手',
  description: 'Built with Claude Vibe Coding',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className + " bg-[#0a0a0f] text-white antialiased"}>
        {children}
      </body>
    </html>
  )
}
