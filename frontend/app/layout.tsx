import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation/main-navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TechPath - Learn to Code Your Way",
  description: "Personalized, flexible, AI-powered learning for women in tech",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
