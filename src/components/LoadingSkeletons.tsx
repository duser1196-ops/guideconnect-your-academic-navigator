import { motion } from "framer-motion";

interface SkeletonPulseProps {
  className?: string;
}

const SkeletonPulse = ({ className = "" }: SkeletonPulseProps) => (
  <motion.div
    animate={{ opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className={`rounded-lg bg-muted ${className}`}
  />
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    {/* Header skeleton */}
    <div className="gradient-primary rounded-2xl p-6 md:p-8">
      <SkeletonPulse className="h-8 w-64 bg-primary-foreground/10 mb-3" />
      <SkeletonPulse className="h-4 w-48 bg-primary-foreground/10 mb-2" />
      <SkeletonPulse className="h-3 w-36 bg-primary-foreground/10" />
    </div>

    {/* Stat cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
          </div>
          <SkeletonPulse className="h-7 w-16" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
      ))}
    </div>

    {/* Content skeleton */}
    <div className="grid lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-6 space-y-4">
          <SkeletonPulse className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <SkeletonPulse className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-4 w-full" />
                <SkeletonPulse className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const CardsSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-8 w-8 rounded-lg" />
          <SkeletonPulse className="h-4 w-32" />
        </div>
        <SkeletonPulse className="h-3 w-full" />
        <SkeletonPulse className="h-3 w-2/3" />
        <SkeletonPulse className="h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export default SkeletonPulse;
