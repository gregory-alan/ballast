import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-100">
      <h1>BALLAST</h1>
      <ul>
        <li><Link href={"/book1/chapter1"}>HISTOIRE EXEMPLE 001</Link></li>
        <li><Link href={"/book1/chapter2"}>HISTOIRE EXEMPLE 002</Link></li>
        <li><Link href={"/book2/chapter1"}>HISTOIRE EXEMPLE 001</Link></li>
        <li><Link href={"/book2/chapter1"}>HISTOIRE EXEMPLE 002</Link></li>
      </ul>
    </main>
  )
}
