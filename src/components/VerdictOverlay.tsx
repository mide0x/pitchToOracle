import { motion, AnimatePresence } from 'framer-motion';

interface VerdictOverlayProps {
    isVisible: boolean;
    category: 'VISIONARY' | 'DELUSIONAL';
    feedback: string;
}

export const VerdictOverlay = ({ isVisible, category, feedback }: VerdictOverlayProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute top-[20%] left-0 w-full z-40 flex flex-col items-center justify-center pointer-events-none"
                >
                    <motion.h2
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.05em" }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className={`text-4xl md:text-5xl font-bold tracking-tight text-center drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] ${
                            category === 'VISIONARY' ? 'text-amber-100' : 'text-gray-300'
                        }`}
                        style={{ fontFamily: "'Playfair Display', serif" }} // Ensure premium serif
                    >
                        {category}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-4 text-center text-lg md:text-xl text-white/90 font-light italic max-w-[80%] leading-relaxed drop-shadow-lg"
                    >
                        {feedback}
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
