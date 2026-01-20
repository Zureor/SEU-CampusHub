import { motion, useScroll, useTransform } from 'framer-motion';

export function AnimatedBackdrop() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 100]);
  const rotate1 = useTransform(scrollY, [0, 2000], [0, 180]);
  const rotate2 = useTransform(scrollY, [0, 2000], [0, -120]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] morph-blob backdrop-blur-animate"
        style={{ 
          y: y1,
          rotate: rotate1,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
        }}
      />
      
      <motion.div
        className="absolute top-1/4 -right-20 w-[400px] h-[400px] morph-blob backdrop-blur-animate"
        style={{ 
          y: y2,
          rotate: rotate2,
          background: 'linear-gradient(225deg, rgba(14, 165, 233, 0.1) 0%, rgba(236, 72, 153, 0.08) 100%)',
          animationDelay: '-4s',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] morph-blob backdrop-blur-animate"
        style={{ 
          y: y3,
          background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
          animationDelay: '-8s',
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-primary/30"
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/3 left-1/3 w-3 h-3 rounded-full bg-accent/30"
        animate={{
          y: [0, 20, 0],
          x: [0, -20, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-pink-400/30"
        animate={{
          y: [0, -25, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
