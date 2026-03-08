import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCard = ({ children, className = "", delay = 0 }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3, transition: { duration: 0.25 } }}
    className={`glass-interactive rounded-xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
