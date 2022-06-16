import classNames from 'classnames';
import React, { useRef, useEffect, HTMLAttributes } from 'react';

export type VideoSize = 'xs-mini' | 'mini' | 'large';

interface VideoProps extends VideoFromStreamProps {
  size: VideoSize;
  className?: string;
  isScreenshare: boolean;
  muted: boolean;
}

type VideoFromStreamProps = {
  srcObject: MediaStream;
} & HTMLAttributes<HTMLVideoElement>;

function VideoFromStream(attrs: VideoFromStreamProps) {
  const srcObject = attrs.srcObject;
  const videoRef = useRef<HTMLVideoElement>(null);
  const childAttrs = { ...attrs, autoPlay: true, ref: videoRef };
  delete childAttrs.srcObject;

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.srcObject = srcObject;
  }, [videoRef, srcObject]);

  return React.createElement('video', childAttrs, null);
}

export const Video = ({ size, className, isScreenshare, ...props }: VideoProps) => {
  const flipAmt = isScreenshare ? 'rotateY(0deg)' : 'rotateY(180deg)';


  return (
    <div className={
      classNames(
        'relative bg-gray-500 overflow-hidden', 
        size === 'xs-mini' && 'w-20 sm:w-28 shadow-md rounded-xl',
        size === 'mini' && 'w-32 sm:w-64',
        size === 'large' && 'w-full lg:rounded-xl',
        className
      )}
    >
      <VideoFromStream {...props} className={classNames('absolute w-full h-full object-cover md:object-contain transform')} style={{transform: flipAmt }} />
    </div>
  )
}