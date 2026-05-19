'use client';

import { motion, type Variants } from 'motion/react';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const springTap = { scale: 0.97 } as const;
export const springTransition = { type: 'spring', stiffness: 400, damping: 25 } as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} transition={springTransition} className={className}>
      {children}
    </motion.div>
  );
}

export { motion };
