import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [x, y, isVisible]);

  return (
    <>
      <motion.div
        className="cursor-glow"
        style={{
          x,
          y,
          opacity: isVisible ? 1 : 0,
        }}
      />
      <motion.div
        className="fixed w-3 h-3 rounded-full bg-primary/80 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.15,
        }}
      />
    </>
  );
}
