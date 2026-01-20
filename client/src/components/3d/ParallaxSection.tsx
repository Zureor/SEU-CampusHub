import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxBackgroundProps {
  imageUrl: string;
  overlayOpacity?: number;
}

export function ParallaxBackground({ imageUrl, overlayOpacity = 0.5 }: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-20 -bottom-20"
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover scale-110"
        />
      </motion.div>
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}

interface Parallax3DCardProps {
  children: ReactNode;
  className?: string;
}

export function Parallax3DCard({ children, className = '' }: Parallax3DCardProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover="hover"
      initial="rest"
      style={{ perspective: 1000 }}
    >
      <motion.div
        variants={{
          rest: { rotateX: 0, rotateY: 0, scale: 1 },
          hover: { rotateX: -5, rotateY: 5, scale: 1.02 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
