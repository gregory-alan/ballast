import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ballast',
  description: `Ballast, ce sont des histoires inédites et originales, accompagnées d'une bande-son immersive, synchronisée avec votre lecture. Que vous aimiez la science-fiction, la fantasy ou les récits d'horreur, plongez dans un imaginaire qui vous correspond.`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-full relative flex items-center justify-center`}>{children}</body>
    </html>
  )
}
