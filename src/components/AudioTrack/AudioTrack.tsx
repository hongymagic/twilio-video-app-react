import { useEffect, useRef } from 'react';
import { AudioTrack as IAudioTrack } from 'twilio-video';
import { useAppState } from '../../state';

interface AudioTrackProps {
  track: IAudioTrack;
}

const useOutsideClick = (callback: () => void) => {
  useEffect(() => {
    document.addEventListener('click', callback, true);

    return () => {
      document.removeEventListener('click', callback, true);
    };
  }, [callback]);
};

export default function AudioTrack({ track }: AudioTrackProps) {
  const { activeSinkId } = useAppState();
  const audioEl = useRef<HTMLAudioElement>();

  useOutsideClick(() => {
    console.log(
      'useOutsideClick',
      !!audioEl.current && !!track && track.isEnabled && track.isStarted && audioEl.current.paused
    );

    // In Safari the auto-play media isn't on by default and could throw an error
    // This forced plays the audio track on mouse click (interaction of the website)
    // thus allowing Safari to play the audio track (like clicking on a video to play)
    if (!!audioEl.current && !!track && track.isEnabled && track.isStarted && audioEl.current.paused) {
      console.log('Trying to play the audio element');
      audioEl.current.play();
    }
  });

  useEffect(() => {
    try {
      audioEl.current = track.attach();
      audioEl.current.setAttribute('data-cy-audio-track-name', track.name);
      audioEl.current.autoplay = true;

      document.body.appendChild(audioEl.current);
    } catch (e) {
      console.error('XXX Error attaching or appending audio track', e);
    }

    return () =>
      track.detach().forEach(el => {
        el.remove();

        // This addresses a Chrome issue where the number of WebMediaPlayers is limited.
        // See: https://github.com/twilio/twilio-video.js/issues/1528
        el.srcObject = null;
      });
  }, [track]);

  useEffect(() => {
    audioEl.current?.setSinkId?.(activeSinkId);
  }, [activeSinkId]);

  console.log(
    'AudioTrack playing',
    !!audioEl.current && !!track && track.isEnabled && track.isStarted && audioEl.current.paused
  );

  return null;
}
