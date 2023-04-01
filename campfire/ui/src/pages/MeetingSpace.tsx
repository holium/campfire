import React, { FC, useEffect } from "react";
import {
  Flex,
  Ship,
  Dialog,
  Button,
  Icons,
  Card,
} from "@holium/design-system";
import { useStore } from "../stores/root";
import { observer } from "mobx-react";
import { Chat } from "../components/Chat";
import { Call } from "../components/Call";
import { Campfire } from "../icons/Campfire";
import { deSig } from "@urbit/api";
import { useHistory } from "react-router";
import { SectionHeader } from "../components/SectionHeader";
import hangup from "../assets/hangup.wav";
import { rgba } from "polished";
import { ringing } from "../stores/media";
import { LoadingMessage } from "../components/LoadingMessage";
import "../styles/animations.css";

export const MeetingSpace: FC<any> = observer(() => {
  const { mediaStore, urchatStore } = useStore();
  const { push } = useHistory();

  // hangup call (properly) if exiting page
  useEffect(() => {
    window.addEventListener("beforeunload", urchatStore.hangup);
    return () => window.removeEventListener("beforeunload", urchatStore.hangup);
  }, []);

  // clear transfered files if exiting page
  useEffect(() => {
    window.addEventListener("beforeunload", urchatStore.clearFileTransfers);
    return () => window.removeEventListener("beforeunload", urchatStore.clearFileTransfers);
  }, []);

  // update devices if chrome devices change (like a USB microphone gets plugged in)
  useEffect(() => {
    const updateDevices = () => mediaStore.getDevices(urchatStore.ongoingCall);
    navigator.mediaDevices.addEventListener("devicechange", updateDevices);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
  });

  useEffect(() => {
    if (urchatStore.ongoingCall?.call?.peer) {
      document.title = "Call with ~" + urchatStore.ongoingCall.call.peer;
    }
  }, [urchatStore.ongoingCall]);

  const sendMessage = (msg: string) => {
    urchatStore.dataChannel?.send(msg);
    const newMessages = [{ speaker: "me", message: msg }].concat(
      urchatStore.messages
    );
    urchatStore.setMessages(newMessages);
  };

  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  return (
    <Flex
      // style={{ background: "#FBFBFB" }}
      flex={1}
      height="100vh"
      width="100%"
      justifyContent="center"
      alignItems="center"
      className="windowColor flex-col sm:flex-row px-4 sm:px-0"
    >
      <Flex
        style={{ position: "relative" }}
        borderRadius={20}
        height="90%"
        m={10}
        justifyContent="center"
        alignItems="center"
        className="baseColor w-full sm:w-3/4"
      >
        {!urchatStore.dataChannelOpen && urchatStore.ongoingCall && (
          <Flex
            flexDirection="column"
            width="100%"
            justifyContent="center"
            alignItems="center"
            className='p-4 sm:p-0'
          >
            <Campfire className="animate" />
            <LoadingMessage connectionState={urchatStore.connectionState} peer={urchatStore.ongoingCall.call.peer} />
            <Flex mt={3}>
              <Button
                title="Hangup"
                style={{
                  fontSize: 20,
                  borderRadius: 24,
                  height: 40,
                  width: 40,
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
                variant="custom"
                bg={rgba("#CF3535", 0.12)}
                onClick={() => {
                  ringing.pause();
                  const audio = new Audio(hangup);
                  audio.volume = 0.8;
                  audio.play();
                  urchatStore.hangup();
                  mediaStore.stopAllTracks();
                  push("/");
                }}
              >
                <Icons.Leave size={24} color="#CF3535" />
              </Button>
            </Flex>
          </Flex>
        )}
        {urchatStore.dataChannelOpen && <Call />}
      </Flex>
      <Flex flexDirection="column" m={10} height="90%" className="w-full sm:w-1/4">
        <Flex flexDirection="column" className='pb-1' gap={6}>
          <SectionHeader
            header="Participants"
            icon={
              <Icons.Participants
                opacity={0.5}
                fontSize="20px"
                color="var(--rlm-icon-color, #000000)"
                aria-hidden
              />
            }
          />
          <Card
            elevation="none"
            borderRadius={9}
            mt={1}
            mb={3}
            style={{
              padding: 8,
              gap: 4,
              backgroundColor: "var(--rlm-card-color, #FBFBFB)"
            }}

          >
            <Flex gap={4} flexDirection="column">
              {/* TODO load contact store into local storage and lookup sigil metadata */}
              <Ship patp={"~" + deSig(urchatStore.urbit.ship)} textColor="var(--rlm-text-color, #000000)" />
              {urchatStore.dataChannelOpen && (
                <Ship
                  patp={"~" + deSig(urchatStore.ongoingCall.call.peer)}
                  textColor="var(--rlm-text-color, #000000)"
                />
              )}
            </Flex>
          </Card>
        </Flex>
        <Flex flexDirection="column" gap={6} height='100%' overflowY='hidden'>
          <SectionHeader
            header="Chat"
            icon={
              <Icons.ChatLine
                opacity={0.5}
                fontSize="20px"
                color="var(--rlm-icon-color, #000000)"
                aria-hidden
              />
            }
          />
          <Chat
            ready={urchatStore.dataChannelOpen}
            messages={urchatStore.messages}
            sendMessage={sendMessage}
          />
        </Flex>
      </Flex>
      <Dialog
        title="Remote Hangup"
        variant="simple"
        hasCloseButton={false}
        primaryButton={
          <Button
            style={{ fontSize: 20, borderRadius: 6, width: "100%" }}
            variant="custom"
            bg="#F8E390"
            color="#333333"
            onClick={() => {
              ringing.pause();
              const audio = new Audio(hangup);
              audio.volume = 0.8;
              audio.play();
              mediaStore.stopAllTracks();
              urchatStore.makeFalseWasHungUp();
              push("/");
            }}
          >
            Go to Campfire home
          </Button>
        }
        backdropOpacity={0.3}
        closeOnBackdropClick={false}
        isShowing={urchatStore.wasHungUp}
        onHide={() => {
          console.log("hiding");
        }}
      >
        The peer has hungup the call with you. Sad!
      </Dialog>
    </Flex>
  );
});
