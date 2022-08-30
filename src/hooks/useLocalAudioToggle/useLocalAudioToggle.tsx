import { LocalAudioTrack } from 'twilio-video';
import { useCallback, useState } from 'react';
import useIsTrackEnabled from '../useIsTrackEnabled/useIsTrackEnabled';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalAudioToggle() {
  const { localTracks, onError, getLocalAudioTrack, removeLocalAudioTrack, room } = useVideoContext();
  const localParticipant = room?.localParticipant;
  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
  const isEnabled = useIsTrackEnabled(audioTrack);
  const [isPublishing, setIspublishing] = useState(false);

  const toggleAudioEnabled = useCallback(() => {
    if (!isPublishing) {
      if (audioTrack) {
        const localTrackPublication = localParticipant?.unpublishTrack(audioTrack);
        // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
        localParticipant?.emit('trackUnpublished', localTrackPublication);
        removeLocalAudioTrack();
      } else {
        setIspublishing(true);
        getLocalAudioTrack()
          .then((track: LocalAudioTrack) => localParticipant?.publishTrack(track, { priority: 'low' }))
          .catch(onError)
          .finally(() => {
            setIspublishing(false);
          });
      }
    }
  }, [audioTrack, getLocalAudioTrack, isPublishing, localParticipant, onError, removeLocalAudioTrack]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
