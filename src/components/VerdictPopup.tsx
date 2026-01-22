import { motion, AnimatePresence } from "framer-motion";
import scrollImage from "../assets/scroll.png";
import type { IdeaVerdict } from "../services/verdictApi";

interface VerdictPopupProps {
    isVisible: boolean;
    verdictType: IdeaVerdict;
    feedback: string;
    onClose?: () => void;
}

export const VerdictPopup = ({
    isVisible,
    verdictType,
    feedback,
    onClose,
}: VerdictPopupProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{
                            opacity: 0,
                            scale: 0.9,
                            transition: { duration: 0.3 },
                        }}
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 100,
                            duration: 0.6,
                        }}
                        className="relative pointer-events-auto flex items-center justify-center"
                        onClick={onClose}
                    >
                        {/* Scroll Image */}
                        <img
                            src={scrollImage}
                            alt="Ancient Scroll"
                            className="w-[120vw] h-auto max-w-[800px] drop-shadow-2xl"
                        />

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-8 pb-8 md:pt-16 md:pb-16">
                            {/* Constrain content width to stay within scroll paper area */}
                            <div className="w-[55%] h-full flex flex-col items-center justify-center space-y-3 md:space-y-6">
                                {/* Decorative Header */}
                                <div className="w-full flex justify-center pb-1 md:pb-2 border-b border-[#5c4033]/20">
                                    <span className="text-[#5c4033] text-[9px] md:text-sm font-serif tracking-[0.2em] uppercase opacity-60 whitespace-nowrap">
                                        The Oracle Speaks
                                    </span>
                                </div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`text-xl md:text-2xl font-bold font-serif tracking-wide ${
                                        verdictType === "VISIONARY"
                                            ? "text-[#8B4513]"
                                            : "text-[#4A4A4A]"
                                    }`}
                                    style={{
                                        textShadow:
                                            "0 1px 2px rgba(255,255,255,0.5)",
                                    }}
                                >
                                    {verdictType}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-[#3d3126] font-serif leading-relaxed italic text-xs md:text-lg wrap-break-words w-full px-2 max-w-[70%]"
                                >
                                    "{feedback}"
                                </motion.p>

                                {/* Seal */}
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 1.5,
                                        rotate: -20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{ delay: 0.7, type: "spring" }}
                                    className="w-10 h-10 md:w-20 md:h-20 rounded-full border-4 border-[#8B0000]/30 bg-[#8B0000]/10 flex items-center justify-center mt-1 md:mt-4 flex-shrink-0"
                                >
                                    <span className="text-[#8B0000] font-serif font-bold text-[8px] md:text-sm transform -rotate-12 opacity-50">
                                        VERIFIED
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
