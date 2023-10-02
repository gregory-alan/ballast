'use client';

import { AudioServiceBuilder } from 'ballast/services/audio';

export default function Book({}: {}) {
  const AudioService = AudioServiceBuilder();

  const load = (slug: string) => {
    AudioService.createAudioResource(
      {
        type: 'music',
        kind: 'toneplayer',
        slug: slug,
        color: 'red',
        loop: false,
        start: 0,
        end: 100,
        inView: true,
        sessions: [[0, 0]],
        onLoad: (sound) => {
          console.log('loaded', sound, new Date().toISOString());
          AudioService.muteAudioResource(slug, false);
          AudioService.playAudioResource(sound.slug);
        },
        onMuted: (sound) => {
          console.log('muted', sound, new Date().toISOString());
        },
        onPlay: (sound) => {
          console.log('played', sound, new Date().toISOString());
        },
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
          load('file_example_MP3_5MG');
          // load('sound-0 .2');
          // load('sound-0 .3');
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
          play('file_example_MP3_5MG');
        }}
      >
        PLAY
      </button>
    </>
  );
}
