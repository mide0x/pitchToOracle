import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import idleVideo from "../assets/idle.webm";
import listeningVideo from "../assets/listening.webm";
import impressedVideo from "../assets/impressed.webm";
import disappointedVideo from "../assets/disappointed.webm";

// Audio imports
import impressedAudio from "../assets/impressed_animation/0109(2).MP3";
import disappointedAudio from "../assets/not_impressed_animation/0109(3).MP3";

interface CharacterLayerProps {
  status: "idle" | "listening" | "processing" | "result";
  verdict?: "VISIONARY" | "DELUSIONAL";
  onVideoEnd: () => void;
  onShowVerdict: () => void;
}

export const CharacterLayer = ({
  status,
  verdict,
  onVideoEnd,
  onShowVerdict,
}: CharacterLayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getVideoSrc = () => {
    switch (status) {
      case "listening":
      case "processing":
        return listeningVideo;
      case "result":
        return verdict === "VISIONARY" ? impressedVideo : disappointedVideo;
      case "idle":
      default:
        return idleVideo;
    }
  };

  // Stable key to prevent remounting between listening and processing
  const getVideoKey = () => {
    if (status === "listening" || status === "processing")
      return "listening-processing-group";
    return status;
  };

  // Handle audio playback
  useEffect(() => {
    if (status === "result" && verdict) {
      const audioSrc =
        verdict === "VISIONARY" ? impressedAudio : disappointedAudio;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.play().catch((e) => console.log("Audio play failed", e));
    } else {
      // Cleanup audio if moving away from result
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [status, verdict]);

  const handleTimeUpdate = () => {
    if (status === "result" && videoRef.current) {
      const timeLeft = videoRef.current.duration - videoRef.current.currentTime;
      // Trigger popup 3 seconds before end (or immediately if video is short)
      if (timeLeft <= 3 && timeLeft > 2.8) {
        onShowVerdict();
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative">
      {/* Grounding Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[30%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.8)_20%,transparent_100%)] blur-xl pointer-events-none mix-blend-multiply" />

      {/* Interactive Character Video */}
      <motion.div
        className="relative w-full h-[90%] flex items-center justify-center cursor-pointer touch-none"
        animate={{
          filter:
            status === "listening"
              ? "drop-shadow(0 0 20px rgba(164,138,255,0.4))"
              : "drop-shadow(0 0 30px rgba(164,138,255,0.1))",
        }}
      >
        <video
          ref={videoRef}
          key={getVideoKey()}
          src={getVideoSrc()}
          autoPlay
          loop={status === "idle"}
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={onVideoEnd}
          className="h-full w-auto max-h-[85vh] object-contain translate-y-[5%]"
          style={{ background: 'transparent' }}
        />
      </motion.div>

      {/* Hint Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: status === "idle" ? 0.6 : status === "processing" ? 0.8 : 0,
        }}
        className="absolute bottom-[5%] text-cream/60 font-serif italic text-sm tracking-wide pointer-events-none z-20"
      >
        {status === "processing"
          ? "The oracle is thinking..."
          : "Tap character to speak"}
      </motion.p>
    </div>
  );
};
