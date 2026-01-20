import { motion, useScroll, useTransform } from 'framer-motion';

export function FloatingShapes() {
  const { scrollY } = useScroll();
  const parallax1 = useTransform(scrollY, [0, 500], [0, -80]);
  const parallax2 = useTransform(scrollY, [0, 500], [0, -50]);
  const parallax3 = useTransform(scrollY, [0, 500], [0, -120]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl parallax-layer"
        style={{ y: parallax1 }}
        animate={{
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-[15%] w-48 h-48 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 blur-3xl parallax-layer"
        style={{ y: parallax2 }}
        animate={{
          x: [0, -30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-40 left-[20%] w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/15 to-purple-500/10 blur-2xl parallax-layer"
        style={{ y: parallax3 }}
        animate={{
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="absolute top-1/2 left-[5%] w-20 h-20"
        animate={{
          y: [0, -40, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full glass rounded-2xl rotate-45 opacity-60" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-[8%] w-16 h-16"
        animate={{
          y: [0, 30, 0],
          rotate: [45, 90, 45],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <div className="w-full h-full glass rounded-full opacity-50" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-[25%] w-24 h-24"
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-full h-full border-2 border-primary/20 rounded-2xl rotate-12" />
      </motion.div>

      <svg className="absolute top-[60%] left-[60%] w-32 h-32 opacity-30" viewBox="0 0 100 100">
        <motion.polygon
          points="50,5 95,75 5,75"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: 'center' }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 83% 58%)" />
            <stop offset="100%" stopColor="hsl(187 85% 43%)" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute top-[70%] left-[40%] w-6 h-6 rounded-full bg-primary/40"
        animate={{
          y: [0, -100, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[80%] left-[70%] w-4 h-4 rounded-full bg-accent/40"
        animate={{
          y: [0, -80, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />
    </div>
  );
}
