import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FanBridge AI — X Layer 链上经纪人',
  description:
    'AI 驱动的 X Layer 链上助手：用自然语言或语音连接钱包、切换网络、查询并转账 OKB。',
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
