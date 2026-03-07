import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCard = ({ children, className = "", delay = 0 }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ y: -4, boxShadow: "0 20px 60px hsla(239,84%,67%,0.12)" }}
    className={`glass rounded-xl p-6 transition-colors ${className}`}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
