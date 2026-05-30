'use client';

import { useCallback, useRef, useState } from 'react';
import type { NoticeData } from '@/components/ui/Notice';

export function useNotice(timeout = 5000) {
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(
    (type: NoticeData['type'], text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setNotice({ type, text });
      timer.current = setTimeout(() => setNotice(null), timeout);
    },
    [timeout]
  );

  return { notice, flash };
}
