/**
 * Unified Page Layout Component
 * 
 * Provides consistent page structure across all pages:
 * - Standardized container widths
 * - Consistent padding
 * - Page header support
 * - Breadcrumbs support
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { standardSpacing, getPagePadding } from '@/lib/design-system/spacing';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerWidth?: 'full' | 'narrow' | 'wide' | 'max';
  padding?: 'none' | 'mobile' | 'tablet' | 'desktop';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  background?: 'default' | 'gradient' | 'pattern';
}

const containerWidths = {
  full: 'w-full',
  narrow: 'max-w-4xl mx-auto',
  wide: 'max-w-6xl mx-auto',
  max: 'max-w-7xl mx-auto',
};

const maxWidths = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

const paddingClasses = {
  none: '',
  mobile: 'px-2 sm:px-4',
  tablet: 'px-4 md:px-6',
  desktop: 'px-4 sm:px-6 lg:px-8',
};

export function PageLayout({
  children,
  className,
  containerWidth = 'wide',
  padding = 'desktop',
  maxWidth,
  background = 'default',
}: PageLayoutProps) {
  const containerClass = maxWidth
    ? cn(maxWidths[maxWidth], 'mx-auto')
    : containerWidths[containerWidth];

  const backgroundClasses = {
    default: 'bg-background',
    gradient: 'bg-gradient-to-b from-background via-card to-background',
    pattern: 'bg-background bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.05),transparent_50%)]',
  };

  return (
    <div className={cn('min-h-screen transition-colors duration-200', backgroundClasses[background])}>
      <div className={cn(containerClass, paddingClasses[padding], className)}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Page Header Component
// ============================================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8 space-y-4', className)}>
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-3 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-xl border border-primary/30 flex-shrink-0">
              {icon}
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-orange-500 bg-clip-text text-transparent mb-2 break-words">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl break-words">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Page Container Component
// ============================================================================

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  none: '',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
};

export function PageContainer({
  children,
  className,
  spacing = 'md',
}: PageContainerProps) {
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

export default PageLayout;

