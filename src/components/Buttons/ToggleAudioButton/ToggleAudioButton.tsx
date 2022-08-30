import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import MicIcon from '../../../icons/MicIcon';
import MicOffIcon from '../../../icons/MicOffIcon';

import useLocalAudioToggle from '../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useDevices from '../../../hooks/useDevices/useDevices';

export default function ToggleAudioButton(props: { disabled?: boolean; className?: string }) {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const { localTracks } = useVideoContext();
  const { hasAudioInputDevices } = useDevices();
  const hasAudioTrack = localTracks.some(track => track.kind === 'audio');
  const lastClickTimeRef = useRef(0);

  const toggleAudio = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 500) {
      lastClickTimeRef.current = Date.now();
      toggleAudioEnabled();
    }
  }, [toggleAudioEnabled]);

  return (
    <Button
      className={props.className}
      onClick={toggleAudio}
      disabled={!hasAudioInputDevices || props.disabled}
      startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
      data-cy-audio-toggle
    >
      {!hasAudioTrack ? 'No Audio' : isAudioEnabled ? 'Mute' : 'Unmute'}
    </Button>
  );
}
