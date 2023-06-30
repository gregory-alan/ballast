import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-100">
      <h1>BALLAST</h1>
      <ul>
        <li><Link href={"/toto/tata"}>HISTOIRE EXEMPLE 001</Link></li>
      </ul>
    </main>
  )
}
