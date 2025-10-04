'use client';

import { useEffect, useState } from 'react';

interface ClientBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ClientBody({ children, className = '' }: ClientBodyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <body 
      className={className}
      suppressHydrationWarning={true}
    >
      {children}
    </body>
  );
}
