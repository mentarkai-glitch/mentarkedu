"use client";

import { lazy, Suspense, ComponentType } from "react";
import { Spinner } from "@/components/ui/loading";

interface LazyComponentProps {
  [key: string]: any;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: LazyComponentProps) {
    return (
      <Suspense fallback={fallback || <Spinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

