'use client';

import { AudioServiceBuilder } from 'ballast/services/audio';

export default function Book({}: {}) {
  const AudioService = AudioServiceBuilder();

  const load = (slug: string) => {
    AudioService.createAudioResource(
      {
        type: 'music',
        kind: 'howl',
        slug: slug,
        color: 'red',
        loop: false,
        start: 0,
        end: 100,
        inView: true,
        sessions: [[0, 0]],
        onPlay: () => console.log(new Date().toISOString()),
      },
      'livre-1'
    );
  };

  const play = (slug: string) => {
    AudioService.muteAudioResource(slug, false);
    AudioService.playAudioResource(slug);
  };

  return (
    <>
      <button
        style={{
          background: 'white',
          padding: '5px 10px',
          width: '100px',
          border: '1px solid grey',
          margin: '4px',
        }}
        onClick={() => {
          load('sound-1.1');
          load('sound-1.2');
          load('sound-1.3');
        }}
      >
        LOAD
      </button>
      <button
        style={{
          background: 'white',
          padding: '5px 10px',
          width: '100px',
          border: '1px solid grey',
          margin: '4px',
        }}
        onClick={() => {
          play('sound-1.1');
          play('sound-1.2');
          play('sound-1.3');
        }}
      >
        PLAY
      </button>
    </>
  );
}
