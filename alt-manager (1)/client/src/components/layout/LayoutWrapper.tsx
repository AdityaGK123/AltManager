import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutWrapperProps {
  children: ReactNode;
  className?: string;
}

const LayoutWrapper = ({ children, className = '' }: LayoutWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-gray-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10 lg:px-16 lg:py-12">
        {children}
      </div>
    </motion.div>
  );
};

export default LayoutWrapper;
