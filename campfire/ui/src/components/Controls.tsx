import classNames from "classnames";
import React, { HTMLAttributes, useCallback } from "react";
import { useHistory } from "react-router";
import { Dialog, DialogContent, DialogTrigger } from "./Dialog";
import { Camera } from "../icons/Camera";
import { Exit } from "../icons/Exit";
import { Mic } from "../icons/Mic";
import { Screenshare } from "../icons/Screenshare";
import { SettingsIcon } from "../icons/Settings";
import { IconToggle } from "./IconToggle";
import { MediaInput } from "./MediaInput";
import { useStore } from "../stores/root";
import { observer } from "mobx-react";
import { Card } from "@holium/design-system";
import { MdUploadFile } from 'react-icons/md';
import { ShareFileDialog, } from "./ShareFileDialog";

type ControlsProps = HTMLAttributes<HTMLDivElement>;

export const Controls = observer(({ className }: ControlsProps) => {
  const { push } = useHistory();
  const { mediaStore, urchatStore } = useStore();

  const leaveCall = useCallback(() => {
    urchatStore.hangup();
    mediaStore.stopAllTracks();
    push("/");
  }, []);

  return (
    <Card
      elevation="none"
      className='w-98 sm:w-4/5'
      style={{
        borderRadius: 16,
        borderColor: "var(--rlm-border-color, #E3E3E3)",
        padding: "6px 16px",
        backgroundColor: "var(--rlm-card-color, #FEFEFE)"
      }}
    >
      <div
        className={classNames("flex flex-wrap justify-center p-3 space-x-4", className)}
        style={{
          backgroundColor: "var(--rlm-card-color, #FEFEFE)"
        }}
      >
        <IconToggle
          className="w-8 sm:w-10 h-8 sm:h-10"
          pressed={mediaStore.audio.enabled}
          onPressedChange={mediaStore.audio.toggle}
        >
          <Mic
            className="w-5 sm:w-6 h-5 sm:h-6"
            primary="fill-current opacity-80"
            secondary="fill-current"
          />
          <span className="sr-only">Audio</span>
        </IconToggle>
        <IconToggle
          className="w-8 sm:w-10 h-8 sm:h-10"
          pressed={mediaStore.video.enabled}
          onPressedChange={mediaStore.video.toggle}
        >
          <Camera
            className="w-5 sm:w-6 h-5 sm:h-6"
            primary="fill-current opacity-80"
            secondary="fill-current"
          />
          <span className="sr-only">Video</span>
        </IconToggle>
        <IconToggle
          className="w-8 sm:w-10 h-8 sm:h-10"
          pressed={!mediaStore.sharedScreen.enabled}
          onPressedChange={() =>
            mediaStore.toggleScreenShare(urchatStore.ongoingCall)
          }
          toggleClass="text-blue-900 bg-blue-500"
        >
          <Screenshare
            className="w-5 sm:w-6 h-5 sm:h-6"
            primary="fill-current opacity-80"
            secondary="fill-current"
          />
          <span className="sr-only">Screenshare</span>
        </IconToggle>
        <Dialog>
          <DialogTrigger className="flex justify-center items-center w-8 sm:w-10 h-8 sm:h-10 text-gray-600 bg-gray-100 rounded-full default-ring">
            <SettingsIcon
              className="w-5 sm:w-6 h-5 sm:h-6"
              primary="fill-current opacity-80"
              secondary="fill-current"
            />
            <span className="sr-only">Devices</span>
          </DialogTrigger>
          <DialogContent className="w-64 max-w-xl py-8 px-8 rounded-xl">
            <MediaInput />
          </DialogContent>
        </Dialog>
        <Dialog open={urchatStore.incomingFileTransfer ? true : undefined} onOpenChange={(open) => open == false && urchatStore.incomingFileTransfer && urchatStore.setIncomingFileTransfer(false)}>
          <DialogTrigger className="flex justify-center items-center w-8 sm:w-10 h-8 sm:h-10 text-gray-600 bg-gray-100 rounded-full default-ring"
          >
            <MdUploadFile className="w-5 sm:w-6 h-5 sm:h-6" />
            <span className="sr-only">Share File</span>
          </DialogTrigger>
          <DialogContent className="rounded-xl max-w-full">
            <ShareFileDialog />
          </DialogContent>
        </Dialog>
        <button
          className="flex justify-center items-center w-8 sm:w-10 h-8 sm:h-10 text-pink-600 bg-pink-100 rounded-full default-ring"
          onClick={leaveCall}
          title="Hang Up"
        >
          <Exit
            className="w-5 sm:w-6 h-5 sm:h-6"
            primary="fill-current opacity-80"
            secondary="fill-current"
          />
          <span className="sr-only">Hang up</span>
        </button>
      </div>
    </Card >
  );
});
