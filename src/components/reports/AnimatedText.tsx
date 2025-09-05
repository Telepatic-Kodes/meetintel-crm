'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  variant?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scaleIn' | 'typewriter';
}

const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  },
  typewriter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }
};

export function AnimatedText({ 
  children, 
  delay = 0, 
  duration, 
  className = '', 
  variant = 'fadeIn' 
}: AnimatedTextProps) {
  const animationVariant = variants[variant];
  
  return (
    <motion.div
      initial={animationVariant.initial}
      animate={animationVariant.animate}
      transition={{
        delay,
        duration: duration || 0.6,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente especializado para títulos
export function AnimatedTitle({ 
  children, 
  delay = 0, 
  className = '' 
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string; 
}) {
  return (
    <AnimatedText 
      variant="slideUp" 
      delay={delay} 
      className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </AnimatedText>
  );
}

// Componente especializado para subtítulos
export function AnimatedSubtitle({ 
  children, 
  delay = 0, 
  className = '' 
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string; 
}) {
  return (
    <AnimatedText 
      variant="slideIn" 
      delay={delay} 
      className={`text-lg font-semibold text-gray-700 ${className}`}
    >
      {children}
    </AnimatedText>
  );
}

// Componente para texto con efecto typewriter
export function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 50,
  className = '' 
}: { 
  text: string; 
  delay?: number; 
  speed?: number;
  className?: string; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          delay: delay + 0.3, 
          duration: text.length * (speed / 1000),
          ease: "linear"
        }}
        className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-blue-500"
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
