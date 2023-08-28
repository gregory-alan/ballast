import Image from 'next/image';

export default function Splash() {
  return (
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
        style={{ marginTop: '10vh' }}
        width={200}
        height={1}
      />
    </div>
  );
}
