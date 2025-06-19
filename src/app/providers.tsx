'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  // Simple provider wrapper - we removed TRPC since we're not using it
  return <>{children}</>;
}