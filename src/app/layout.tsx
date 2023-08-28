import './globals.css';
import { Inter } from 'next/font/google';
import Image from 'next/image';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ballast',
  description: `Ballast, ce sont des histoires inédites et originales, accompagnées d'une bande-son immersive, synchronisée avec votre lecture. Que vous aimiez la science-fiction, la fantasy ou les récits d'horreur, plongez dans un imaginaire qui vous correspond.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} w-full h-full relative flex flex-col items-center justify-center`}
      >
        <div className="splash">
          <Image
            className="relative"
            src={`/images/logo-with-catchphrase.svg`}
            alt="Ballast (logo)"
            width={200}
            height={1}
            priority
          />
          <Image
            className="relative"
            src={`/images/loading.svg`}
            alt="Chargement"
            style={{marginTop: '10vh'}}
            width={200}
            height={1}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
