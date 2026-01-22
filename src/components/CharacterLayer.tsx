import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import idleVideo from "../assets/idle.webm";
import listeningVideo from "../assets/listening.webm";
import impressedVideo from "../assets/impressed.webm";
import disappointedVideo from "../assets/disappointed.webm";
import mic_icon from "../assets/ic_mic.svg";

// Audio imports
import impressedAudio from "../assets/impressed_animation/0109(2).MP3";
import disappointedAudio from "../assets/not_impressed_animation/0109(3).MP3";
import type { VerdictType } from "../services/verdictApi";
import type { OracleStatus } from "../types/OracleStatus";

const IOS_VIDEO_SOURCES = {
    idle: "/ios/idle.hevc.mov",
    listening: "/ios/listening.hevc.mov",
    impressed: "/ios/impressed.hevc.mov",
    disappointed: "/ios/disappointed.hevc.mov",
};

const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

interface CharacterLayerProps {
    oracleStatus: OracleStatus;
    verdictType?: VerdictType;
    onVideoEnd: () => void;
    onShowVerdict: () => void;
}

// FIXME the Oracle isn't centered, possibly inherent in the video..
// this shifts the oracle leftwards. 
const oracleOffsetMod = "-translate-x-5";
export const CharacterLayer = ({
    oracleStatus,
    verdictType,
    onVideoEnd,
    onShowVerdict,
}: CharacterLayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [useHevc, setUseHevc] = useState(() => {
        if (!isIOS) return false;

        const probeVideo = document.createElement("video");
        const canPlay =
            probeVideo.canPlayType('video/mp4; codecs="hvc1"') ||
            probeVideo.canPlayType('video/mp4; codecs="hev1"') ||
            probeVideo.canPlayType('video/quicktime; codecs="hvc1"');

        return !!canPlay;
    });

    const useCanvasChromaKey = isIOS && !useHevc;

    const getVideoSrc = () => {
        switch (oracleStatus) {
            case "listening":
            case "processing":
                return useHevc ? IOS_VIDEO_SOURCES.listening : listeningVideo;
            case "result":
                if (verdictType === "VISIONARY") {
                    return useHevc
                        ? IOS_VIDEO_SOURCES.impressed
                        : impressedVideo;
                }
                return useHevc
                    ? IOS_VIDEO_SOURCES.disappointed
                    : disappointedVideo;
            case "idle":
            default:
                return useHevc ? IOS_VIDEO_SOURCES.idle : idleVideo;
        }
    };

    // Stable key to prevent remounting between listening and processing
    const getVideoKey = () => {
        if (oracleStatus === "listening" || oracleStatus === "processing")
            return `listening-processing-group-${useHevc ? "hevc" : "webm"}`;
        return `${oracleStatus}-${useHevc ? "hevc" : "webm"}`;
    };

    // Handle audio playback
    useEffect(() => {
        if (oracleStatus === "result" && verdictType) {
            const audioSrc =
                verdictType === "VISIONARY"
                    ? impressedAudio
                    : disappointedAudio;
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
    }, [oracleStatus, verdictType]);

    useEffect(() => {
        if (!useCanvasChromaKey) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animationFrame = 0;
        let lastTime = -1;
        const whiteThreshold = 250;

        const renderFrame = () => {
            if (video.readyState >= 2 && video.currentTime !== lastTime) {
                lastTime = video.currentTime;
                const { videoWidth, videoHeight } = video;
                if (videoWidth && videoHeight) {
                    if (
                        canvas.width !== videoWidth ||
                        canvas.height !== videoHeight
                    ) {
                        canvas.width = videoWidth;
                        canvas.height = videoHeight;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const frame = ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    const data = frame.data;
                    for (let i = 0; i < data.length; i += 4) {
                        if (
                            data[i] > whiteThreshold &&
                            data[i + 1] > whiteThreshold &&
                            data[i + 2] > whiteThreshold
                        ) {
                            data[i + 3] = 0;
                        }
                    }
                    ctx.putImageData(frame, 0, 0);
                }
            }

            animationFrame = requestAnimationFrame(renderFrame);
        };

        animationFrame = requestAnimationFrame(renderFrame);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [useCanvasChromaKey, oracleStatus, verdictType]);

    const handleTimeUpdate = () => {
        if (oracleStatus === "result" && videoRef.current) {
            const timeLeft =
                videoRef.current.duration - videoRef.current.currentTime;
            // Trigger popup 3 seconds before end (or immediately if video is short)
            if (timeLeft <= 3 && timeLeft > 2.8) {
                onShowVerdict();
            }
        }
    };

    const handleVideoLoadedData = () => {
        if (!isIOS || !useHevc) return;
        const video = videoRef.current;
        if (!video) return;

        const { videoWidth, videoHeight } = video;
        if (!videoWidth || !videoHeight) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        const frame = ctx.getImageData(0, 0, videoWidth, videoHeight);
        const data = frame.data;

        let hasAlpha = false;
        const step = Math.max(
            1,
            Math.floor(Math.min(videoWidth, videoHeight) / 60)
        );
        for (let y = 0; y < videoHeight; y += step) {
            for (let x = 0; x < videoWidth; x += step) {
                const idx = (y * videoWidth + x) * 4 + 3;
                if (data[idx] < 250) {
                    hasAlpha = true;
                    break;
                }
            }
            if (hasAlpha) break;
        }

        const offset = Math.min(
            2,
            Math.floor(videoWidth / 50),
            Math.floor(videoHeight / 50)
        );
        const cornerPoints: Array<[number, number]> = [
            [offset, offset],
            [videoWidth - 1 - offset, offset],
            [offset, videoHeight - 1 - offset],
            [videoWidth - 1 - offset, videoHeight - 1 - offset],
        ];

        const whiteCorners = cornerPoints.every(([x, y]) => {
            const idx = (y * videoWidth + x) * 4;
            return (
                data[idx] > 245 && data[idx + 1] > 245 && data[idx + 2] > 245
            );
        });

        if (!hasAlpha && whiteCorners) {
            setUseHevc(false);
        }
    };

    const handleVideoError = () => {
        if (useHevc) {
            setUseHevc(false);
        }
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative">
            {/* Grounding Shadow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[30%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.8)_20%,transparent_100%)] blur-xl pointer-events-none mix-blend-multiply" />

            {oracleStatus === 'idle' &&             
                <motion.div
                    className="absolute top-[28%] text-cream/50 font-serif italic text-sm tracking-wide pointer-events-none z-20 animate-pulse"
                    animate={{
                        opacity: oracleStatus === "idle" ? 0.6 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <img src={mic_icon} alt="microphone" className="w-13"/>
                </motion.div>
            }

            {/* Interactive Character Video */}
            <motion.div
                className={`relative w-full h-[90%] flex items-center justify-center cursor-pointer touch-none ${oracleOffsetMod}`}
                animate={{
                    filter:
                        oracleStatus === "listening"
                            ? "drop-shadow(0 0 20px rgba(164,138,255,0.4))"
                            : "drop-shadow(0 0 30px rgba(164,138,255,0.1))",
                }}
            >
                <video
                    ref={videoRef}
                    key={getVideoKey()}
                    src={getVideoSrc()}
                    autoPlay
                    loop={oracleStatus === "idle"}
                    muted
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={onVideoEnd}
                    onLoadedData={handleVideoLoadedData}
                    onError={handleVideoError}
                    className={`h-full w-auto max-h-[85vh] object-contain translate-y-[5%] ${
                        useCanvasChromaKey
                            ? "opacity-0 pointer-events-none"
                            : ""
                    }`}
                    style={{ background: "transparent" }}
                />
                {useCanvasChromaKey && (
                    <canvas
                        ref={canvasRef}
                        className="h-full w-auto max-h-[85vh] object-contain translate-y-[5%]"
                    />
                )}
            </motion.div>


            {oracleStatus === 'processing' &&             
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 0.8,
                    }}
                    className="absolute top-[25%] text-cream/60 font-serif italic text-lg tracking-wide pointer-events-none z-20 animate-pulse"
                >
                    let me think...
                </motion.p>
            }
        </div>
    );
};
