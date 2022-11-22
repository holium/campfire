import classNames from "classnames";
import React, { useEffect } from "react";
import { useStore } from "../stores/root";
import { Controls } from "./Controls";
import { Video } from "./Video";
import { observer } from "mobx-react";
import enterSound from "../assets/enter-call.wav";
import { Flex } from "@holium/design-system";

export const Call = observer(() => {
  const { mediaStore } = useStore();
  const landscape =
    mediaStore.video.tracks[0]?.getSettings()?.aspectRatio > 1 || true;
  console.log("rerender call");
  const hasRemoteScreenshare = mediaStore.remoteVideoTrackCounter > 1;

  var localScreenShare = null;
  var remoteScreenShare = null;
  if (hasRemoteScreenshare) {
    console.log("has remote screenshare");
    const screensharetrack = mediaStore.remote.getVideoTracks()[1];
    remoteScreenShare = new MediaStream([screensharetrack]);
  }
  if (mediaStore.sharedScreen.enabled) {
    console.log("local screenshare");
    const screensharetrack = mediaStore.local.getVideoTracks()[1];
    localScreenShare = new MediaStream([screensharetrack]);
  }

  useEffect(() => {
    const enter: HTMLAudioElement = new Audio(enterSound);
    enter.volume = 0.8;
    enter.play();
  }, []);

  return (
    <>
      <div className="relative w-full h-full overflow-hidden lg:rounded-xl">
        <div className="absolute z-10 top-2 left-2 sm:top-6 sm:left-6">
          <Video
            size={landscape ? "mini" : "xs-mini"}
            muted={true}
            isOur
            srcObject={mediaStore.local}
            className={classNames(
              "border border-white",
              landscape && "aspect-w-16 aspect-h-9",
              !landscape && "aspect-w-9 aspect-h-16"
            )}
          />
          {mediaStore.sharedScreen.enabled && (
            <Video
              size={landscape ? "mini" : "xs-mini"}
              muted={true}
              isScreenshare={true}
              srcObject={localScreenShare}
              className={classNames(
                "border border-white",
                landscape && "aspect-w-16 aspect-h-9",
                !landscape && "aspect-w-9 aspect-h-16"
              )}
            />
          )}
        </div>
        <div id="remotevideos" className="h-full w-full flex flex-col">
          <Video
            size="large"
            className="flex-1"
            isScreenshare={false}
            srcObject={mediaStore.remote}
            muted={false}
          />
          {hasRemoteScreenshare && (
            <Video
              size="large"
              className="flex-1"
              isScreenshare={true}
              controls={true}
              srcObject={remoteScreenShare}
              muted={false}
            />
          )}
        </div>
        <Flex
          className="transform"
          position="absolute"
          justifyContent="center"
          left={20}
          right={20}
          bottom={20}
        >
          <Controls />
        </Flex>
      </div>
    </>
  );
});
