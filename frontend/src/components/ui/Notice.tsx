'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface NoticeData {
  type: 'success' | 'error';
  text: string;
}

interface NoticeProps {
  notice: NoticeData | null;
}

export default function Notice({ notice }: NoticeProps) {
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notice.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
