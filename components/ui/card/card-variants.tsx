/**
 * Card Variants System
 * 
 * Provides semantic card variants with consistent styling:
 * - Stat Card - For metrics and statistics
 * - Feature Card - For feature highlights
 * - Empty Card - For empty states
 * - Success/Error/Info Cards - For status messages
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================================================
// Base Card Props
// ============================================================================

export interface BaseCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// ============================================================================
// Stat Card Component
// ============================================================================

export interface StatCardProps extends BaseCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  description?: string;
  variant?: 'default' | 'highlight' | 'muted';
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  description,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  const variantClasses = {
    default: 'bg-slate-900/60 border-slate-800',
    highlight: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30',
    muted: 'bg-slate-900/40 border-slate-700',
  };

  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUp 
    : trend?.direction === 'down' 
    ? TrendingDown 
    : Minus;

  const trendColor = trend?.direction === 'up'
    ? 'text-green-400'
    : trend?.direction === 'down'
    ? 'text-red-400'
    : 'text-slate-400';

  return (
    <Card
      className={cn(
        variantClasses[variant],
        onClick && 'cursor-pointer hover:border-yellow-500/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">{label}</span>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-3xl font-semibold text-white">{value}</p>
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {trend?.label && (
          <p className="text-xs text-slate-500">{trend.label}</p>
        )}
        
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Feature Card Component
// ============================================================================

export interface FeatureCardProps extends BaseCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  badge?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  action,
  variant = 'default',
  badge,
  className,
  onClick,
}: FeatureCardProps) {
  const variantClasses = {
    default: 'bg-slate-900/50 border-yellow-500/30',
    gradient: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30',
    glass: 'bg-slate-800/50 backdrop-blur-sm border-slate-700',
  };

  return (
    <Card
      className={cn(
        variantClasses[variant],
        onClick && 'cursor-pointer hover:scale-[1.02] transition-transform',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                {title}
                {badge && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full font-semibold">
                    {badge}
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
          {action}
        </div>
        {description && (
          <CardDescription className="text-slate-300 mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

// ============================================================================
// Status Card Components
// ============================================================================

export interface StatusCardProps extends BaseCardProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SuccessCard({
  title,
  message,
  icon,
  action,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {icon && <div className="text-green-400 flex-shrink-0">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-green-400 mb-2">{title}</CardTitle>
            <p className="text-slate-300 text-sm">{message}</p>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export function ErrorCard({
  title,
  message,
  icon,
  action,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {icon && <div className="text-red-400 flex-shrink-0">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-red-400 mb-2">{title}</CardTitle>
            <p className="text-slate-300 text-sm">{message}</p>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export function InfoCard({
  title,
  message,
  icon,
  action,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {icon && <div className="text-blue-400 flex-shrink-0">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-blue-400 mb-2">{title}</CardTitle>
            <p className="text-slate-300 text-sm">{message}</p>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export function WarningCard({
  title,
  message,
  icon,
  action,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {icon && <div className="text-orange-400 flex-shrink-0">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-orange-400 mb-2">{title}</CardTitle>
            <p className="text-slate-300 text-sm">{message}</p>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

// Export all card variants
export default {
  StatCard,
  FeatureCard,
  SuccessCard,
  ErrorCard,
  InfoCard,
  WarningCard,
};





