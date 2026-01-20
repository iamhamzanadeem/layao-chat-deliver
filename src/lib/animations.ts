/**
 * Shared Framer Motion animation variants for consistent animations across the app
 */

import type { Variants, Transition } from 'framer-motion';

// Spring transition for natural feel
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// Smooth ease transition
export const smoothTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

// Message bubble animations
export const messageVariants: Variants = {
  initial: (isFromUser: boolean) => ({
    opacity: 0,
    x: isFromUser ? 20 : -20,
    scale: 0.95,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

// Fade in with upward motion
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

// Fade in with scale
export const fadeInScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

// Slide in from right (for cart button, etc.)
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

// Collapse/expand animation (for panels)
export const collapseVariants: Variants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: 'auto',
    opacity: 1,
  },
  exit: {
    height: 0,
    opacity: 0,
  },
};

// Button scale on tap
export const tapScale = {
  whileTap: { scale: 0.95 },
};

// Hover scale effect
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

// Stagger children animations
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

// Cart button bounce animation
export const cartBounce: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springTransition,
  },
};
