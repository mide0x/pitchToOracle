import { useState } from "react";
import { BackgroundLayer } from "./BackgroundLayer";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleLayer } from "./ParticleLayer";
import { CharacterLayer } from "./CharacterLayer";
import { VerdictPopup } from "./VerdictPopup";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import getVerdict, { type Verdict } from "../services/verdictApi";
import type { OracleStatus } from "../types/OracleStatus";


// TODO `fix the delay.. between sending voice note and result..
// the animation should play immediately i'm done speaking..`

export const VisionPage = () => {
  const [status, setStatus] = useState<OracleStatus>("idle");
  const [verdict, setVerdict] = useState< Verdict | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const { startRecording, stopRecording } = useAudioRecorder();

  const handleStartInteraction = async () => {
    if (status !== "idle" && status !== "result") return;

    setStatus("listening");
    await startRecording();
  };

  const handleEndInteraction = async () => {
    if (status !== "listening") return;

    setStatus("processing");
    const audioBlob = await stopRecording();

    console.log("Audio recorded:", {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    // TODO, verdict is null when an error occurs
    // the UI should handle this
    const verdict = await getVerdict(audioBlob);

    setVerdict(verdict);
    setStatus("result");
  };

  const handleVideoEnd = () => {
    // Video ended, keep showing result until user dismisses popup
  };

  const handleShowVerdict = () => {
    setShowResultPopup(true);
  };

  const resetFlow = () => {
    setStatus("idle");
    setVerdict(null);
    setShowResultPopup(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Desktop Background */}
      <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle_at_center,_#2a1f4e_0%,_#000000_100%)] blur-3xl scale-125 pointer-events-none" />

      {/* Mobile Container. this will display as a mini card on Web */}
      <main className="relative w-full md:max-w-[480px] h-full md:h-auto md:aspect-[9/19] md:max-h-[90vh] flex flex-col items-center overflow-hidden font-serif selection:bg-purple-900 selection:text-white shadow-2xl bg-[#020204] md:rounded-[40px] md:border md:border-white/5 transition-all duration-300">
        <BackgroundLayer />
        <ParticleLayer />

        {/* Vignette Overlay */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9),_inset_0_0_30px_rgba(42,31,78,0.5)] mix-blend-multiply"
          animate={{
            boxShadow: [
              "inset 0 0 100px rgba(0,0,0,0.9), inset 0 0 30px rgba(42,31,78,0.5)",
              "inset 0 0 150px rgba(0,0,0,0.95), inset 0 0 60px rgba(42,31,78,0.7)",
              "inset 0 0 100px rgba(0,0,0,0.9), inset 0 0 30px rgba(42,31,78,0.5)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_20px_2px_rgba(212,175,55,0.1)] rounded-[inherit]" />

        {/* Character Layer */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center"
          // Only allow start on character tap if idle or result
          onClick={() => {
            if (status === "idle") handleStartInteraction();
          }}
          whileTap={status === "idle" ? { scale: 0.98 } : {}}
        >
          <CharacterLayer
            oracleStatus={status}
            verdictType={verdict?.type}
            onVideoEnd={handleVideoEnd}
            onShowVerdict={handleShowVerdict}
          />
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-20 w-full h-full flex flex-col items-center py-8 px-6 safe-area-inset-bottom pointer-events-none">
          {/* Header Text - Hidden during interaction */}
          <AnimatePresence>
            {status === "idle" && (
              <header className="absolute top-12 left-0 w-full text-center z-20">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-5xl font-serif font-medium leading-[1.15] text-cream tracking-wide drop-shadow-2xl">
                    Pitch your idea
                    <br />
                    <span className="italic block mt-1">The oracle decides</span>
                  </h1>
                </motion.div>
                {/* TODO a mic icon here is more intuitive.. */}
              </header>
            )}
          </AnimatePresence>

          {/* Interaction Controls */}
          <AnimatePresence>
            {status === "listening" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[15%] z-30 flex flex-col items-center gap-4 pointer-events-auto"
              >
                <p className="text-white/80 font-serif italic tracking-wide animate-pulse">
                  Listening...
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndInteraction();
                  }}
                  className="px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white font-medium hover:bg-white/20 transition-all active:scale-95"
                >
                  Done Speaking
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <VerdictPopup
            isVisible={showResultPopup}
            verdictType={verdict?.type || "DELUSIONAL"}
            feedback={verdict?.message || ""}
            onClose={resetFlow}
          />
        </div>
      </main>
    </div>
  );
};

