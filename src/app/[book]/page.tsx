'use client';

import { useEffect, useRef } from 'react';
import { AudioService } from 'ballast/services/audio';
import { Sound } from 'ballast/types/AudioService';

export default function Home() {
  const AS = useRef<ReturnType<typeof AudioService>>();

  useEffect(() => {
    const sounds = [
      {
        slug: '1',
        type: 'music',
        kind: 'toneplayer',
        color: '#bbbbbb',
        loop: false,
        start: 0,
        end: 300,
        sessions: [[0, 300]],
      },
    ] as Sound[];

    AS.current = AudioService(sounds);
    AS.current.createAudioResource(sounds[0]);
  }, []);

  const onClick = () =>
    AS.current?.startAudioContext(
      () => {},
      () => {
        AS.current?.muteAudioResource('1', false);
        AS.current?.playAudioResource('1');
      }
    );

  return <button onClick={onClick}>BUTTON</button>;
}
