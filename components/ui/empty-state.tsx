/**
 * Empty State Component
 * 
 * Provides consistent empty state UI across the platform
 * with multiple variants for different use cases
 */

'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileQuestion,
  Inbox,
  Search,
  AlertCircle,
  Plus,
  RefreshCw,
  Home,
} from 'lucide-react';

export interface EmptyStateProps {
  variant?: 'no-data' | 'error' | 'not-found' | 'empty-search' | 'empty-list';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultVariants = {
  'no-data': {
    icon: <Inbox className="w-12 h-12" />,
    title: 'No data yet',
    description: 'Get started by creating your first item.',
  },
  error: {
    icon: <AlertCircle className="w-12 h-12" />,
    title: 'Unable to load',
    description: 'Something went wrong. Please try again.',
  },
  'not-found': {
    icon: <FileQuestion className="w-12 h-12" />,
    title: 'Not found',
    description: 'The item you\'re looking for doesn\'t exist.',
  },
  'empty-search': {
    icon: <Search className="w-12 h-12" />,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
  },
  'empty-list': {
    icon: <Inbox className="w-12 h-12" />,
    title: 'Nothing here yet',
    description: 'Start by adding your first item.',
  },
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const defaultVariant = defaultVariants[variant];

  const displayIcon = icon || defaultVariant.icon;
  const displayTitle = title || defaultVariant.title;
  const displayDescription = description || defaultVariant.description;

  const iconColors = {
    'no-data': 'text-slate-400',
    error: 'text-red-400',
    'not-found': 'text-yellow-400',
    'empty-search': 'text-blue-400',
    'empty-list': 'text-slate-400',
  };

  return (
    <Card
      className={cn(
        'bg-slate-900/50 border-slate-700',
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={cn('mb-4 text-slate-400', iconColors[variant])}>
          {displayIcon}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {displayTitle}
        </h3>
        
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          {displayDescription}
        </p>

        {(action || secondaryAction) && (
          <div className="flex gap-3 flex-wrap justify-center">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                className={
                  action.variant === 'outline'
                    ? 'border-yellow-500/50 text-yellow-400 hover:border-yellow-500'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold'
                }
              >
                {action.label === 'Create' || action.label === 'Add' ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : action.label === 'Refresh' || action.label === 'Retry' ? (
                  <RefreshCw className="w-4 h-4 mr-2" />
                ) : action.label === 'Home' ? (
                  <Home className="w-4 h-4 mr-2" />
                ) : null}
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export variant-specific components for convenience
export function EmptyDataState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState variant="no-data" {...props} />;
}

export function EmptyErrorState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState variant="error" {...props} />;
}

export function EmptySearchState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState variant="empty-search" {...props} />;
}

export function EmptyListState(props: Omit<EmptyStateProps, 'variant'>) {
  return <EmptyState variant="empty-list" {...props} />;
}

export default EmptyState;





