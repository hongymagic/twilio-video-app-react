import React, { useEffect, useRef } from 'react';
import { styled, Theme } from '@material-ui/core/styles';
import { Logger } from 'twilio-video';

import MenuBar from './components/MenuBar/MenuBar';
import MobileTopMenuBar from './components/MobileTopMenuBar/MobileTopMenuBar';
import PreJoinScreens from './components/PreJoinScreens/PreJoinScreens';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import RecordingNotifications from './components/RecordingNotifications/RecordingNotifications';
import Room from './components/Room/Room';

import useHeight from './hooks/useHeight/useHeight';
import useRoomState from './hooks/useRoomState/useRoomState';
import useVideoContext from './hooks/useVideoContext/useVideoContext';
import { useAppState } from './state';

Logger.getLogger('twilio-video').setLevel('info');

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
});

const Main = styled('main')(({ theme }: { theme: Theme }) => ({
  overflow: 'hidden',
  paddingBottom: `${theme.footerHeight}px`, // Leave some space for the footer
  background: 'black',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: `${theme.mobileFooterHeight + theme.mobileTopBarHeight}px`, // Leave some space for the mobile header and footer
  },
}));

export default function App() {
  const { getToken } = useAppState();
  const { connect, isConnecting } = useVideoContext();
  const roomState = useRoomState();
  const isExecutingRef = useRef<boolean>(false);

  // Automatically join on page load
  useEffect(() => {
    if (!isConnecting && roomState === 'disconnected' && !isExecutingRef.current) {
      isExecutingRef.current = true;
      getToken(`${(Math.random() * 10000000) | 0}-${Date.now()}`, 'hongymagic').then(({ token }) => {
        console.log('token', token);
        connect(token);
      });
    }
  }, [roomState, isConnecting, getToken, connect]);

  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight();

  return (
    <Container style={{ height }}>
      {roomState === 'disconnected' ? (
        <PreJoinScreens />
      ) : (
        <Main>
          <ReconnectingNotification />
          <RecordingNotifications />
          <MobileTopMenuBar />
          <Room />
          <MenuBar />
        </Main>
      )}
    </Container>
  );
}
