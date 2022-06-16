import classNames from "classnames";
import React from "react";
import { useMediaStore } from "../useMediaStore";
import { useMock } from "../util";
import { Controls } from "./Controls";
import { Spinner } from "./Spinner";
import { Video } from "./Video";

interface CallProps {
  connected: boolean;
}

export const Call = ({ connected }: CallProps) => {
  const { local, remote, video } = useMediaStore(s => ({ local: s.local, remote: s.remote, video: s.video }));
  const landscape = (video.tracks[0]?.getSettings()?.aspectRatio > 1) || true;
  const hasScreenshare = remote.getVideoTracks().some(x => x.contentHint === "screenshare");
  console.log("has screenshare value: "+hasScreenshare);
  // const cameratrack = remote.getVideoTracks().filter(x => x.contentHint != "screenshare")[0];
  // const audiotrack = remote.getAudioTracks()[0];
  // const remoteCamera = new MediaStream([cameratrack,audiotrack]);


  var remoteScreenShare = null;
  if(hasScreenshare){
    console.log("has screenshare, making MediaStream");
    const screensharetrack = remote.getVideoTracks().filter(x => x.contentHint == "screenshare")[0];
    remoteScreenShare = new MediaStream([screensharetrack]);
  }

  return (
    <>
      <div className="relative w-full h-full">
        <div className="absolute z-10 top-2 left-2 sm:top-6 sm:left-6">
          <Video 
            size={landscape ? 'mini' : 'xs-mini'} 
            muted={true}
            isScreenshare={false}
            srcObject={local} 
            className={classNames(
              'border border-white',
              landscape && 'aspect-w-16 aspect-h-9',
              !landscape && 'aspect-w-9 aspect-h-16'
            )}
          />
        </div>
        <Video size="large" className="absolute inset-0 h-full w-full" isScreenshare={false} srcObject={remote} muted={false} />
        {hasScreenshare &&  
          <Video size="large" className="absolute inset-0 h-full w-full" isScreenshare={true} srcObject={remoteScreenShare} muted={false} />
        }
        {!connected && 
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center mb-2">
              <Spinner className="h-6 w-6 mr-2" />
              <h2 className="font-semibold text-xl text-pink-400">Connecting...</h2>
            </div>
            <p className="text-gray-300">This could take up to a minute.</p>
          </div>
        }
        <Controls className="absolute z-10 bottom-0 left-1/2 transform -translate-x-1/2" />
      </div>
    </>
  )
}