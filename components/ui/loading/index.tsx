/**
 * Unified Loading Components Library
 * 
 * Provides consistent loading states across the platform:
 * - Spinner - Simple loading indicator
 * - Skeleton - Content placeholder
 * - CardSkeleton - Card-shaped skeleton
 * - PageLoader - Full page loader
 * - ButtonLoader - Button loading state
 */

'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// Spinner Component
// ============================================================================

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'default' | 'gold' | 'purple' | 'blue';
}

export function Spinner({ size = 'md', className, color = 'default' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    default: 'text-slate-400',
    gold: 'text-gold',
    purple: 'text-purple',
    blue: 'text-blue',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// ============================================================================
// Button Loader Component
// ============================================================================

export interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonLoader({ size = 'sm', className }: ButtonLoaderProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size={size} />
      <span>Loading...</span>
    </span>
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <Skeleton
      className={cn(
        variantClasses[variant],
        animation === 'pulse' && 'animate-pulse',
        className
      )}
      style={style}
    />
  );
}

// ============================================================================
// Card Skeleton Component
// ============================================================================

export interface CardSkeletonProps {
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function CardSkeleton({
  lines = 3,
  showHeader = true,
  showFooter = false,
  className,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-700 bg-slate-900/50 p-6',
        className
      )}
    >
      {showHeader && (
        <div className="mb-4 space-y-2">
          <LoadingSkeleton variant="rectangular" height={24} width="60%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            variant="text"
            width={i === lines - 1 ? '80%' : '100%'}
          />
        ))}
      </div>
      
      {showFooter && (
        <div className="mt-6 flex gap-2">
          <LoadingSkeleton variant="rectangular" height={36} width={100} />
          <LoadingSkeleton variant="rectangular" height={36} width={100} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Page Loader Component
// ============================================================================

export interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function PageLoader({
  message = 'Loading...',
  fullScreen = true,
  className,
}: PageLoaderProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <Spinner size="xl" color="gold" />
      {message && (
        <p className="text-slate-400 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-24">{content}</div>;
}

// ============================================================================
// Inline Loader Component
// ============================================================================

export interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoader({
  message,
  size = 'md',
  className,
}: InlineLoaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Spinner size={size} />
      {message && <span className="text-slate-400 text-sm">{message}</span>}
    </div>
  );
}

// Export all loading components
export default {
  Spinner,
  ButtonLoader,
  LoadingSkeleton,
  CardSkeleton,
  PageLoader,
  InlineLoader,
};





