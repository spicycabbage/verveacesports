"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NativeVideoPlayerProps = {
  src: string;
  poster?: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
};

export function NativeVideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
}: NativeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <div
      className={cn(
        "group relative aspect-video overflow-hidden rounded-xl bg-black",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        autoPlay={autoPlay}
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="pointer-events-auto h-10 w-10 shrink-0 rounded-full bg-black/60 backdrop-blur hover:bg-black/80"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="pointer-events-auto h-10 w-10 shrink-0 rounded-full bg-black/60 backdrop-blur hover:bg-black/80"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
