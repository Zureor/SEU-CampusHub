import { motion } from 'framer-motion';

export function Loading3D() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            <div className="relative w-24 h-24" style={{ perspective: '1000px' }}>
                {/* Outer Cube */}
                <motion.div
                    className="absolute inset-0 w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateX: [0, 360],
                        rotateY: [0, 360],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {/* Faces */}
                    {[
                        'translateZ(48px)',
                        'rotateY(180deg) translateZ(48px)',
                        'rotateY(90deg) translateZ(48px)',
                        'rotateY(-90deg) translateZ(48px)',
                        'rotateX(90deg) translateZ(48px)',
                        'rotateX(-90deg) translateZ(48px)',
                    ].map((transform, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 border-2 border-primary/50 bg-primary/10 backdrop-blur-sm rounded-lg"
                            style={{ transform }}
                        />
                    ))}
                </motion.div>

                {/* Inner Cube */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateX: [360, 0],
                        rotateY: [360, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {[
                        'translateZ(24px)',
                        'rotateY(180deg) translateZ(24px)',
                        'rotateY(90deg) translateZ(24px)',
                        'rotateY(-90deg) translateZ(24px)',
                        'rotateX(90deg) translateZ(24px)',
                        'rotateX(-90deg) translateZ(24px)',
                    ].map((transform, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 bg-accent/60 shadow-[0_0_15px_rgba(var(--accent),0.5)] border border-white/20"
                            style={{ transform }}
                        />
                    ))}
                </motion.div>

                {/* Glow effect */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-32 h-32 -ml-16 -mt-16 bg-primary/20 blur-3xl rounded-full pointer-events-none"
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
        </div>
    );
}
