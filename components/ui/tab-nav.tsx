/**
 * Unified Tab Navigation Component
 * 
 * Provides consistent tab navigation across all pages with:
 * - Responsive behavior (mobile/desktop)
 * - Consistent styling
 * - Accessibility support
 * - Flexible configuration
 */

'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TabNavItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabNavProps {
  items: TabNavItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  mobileCollapse?: boolean;
}

export function TabNav({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = true,
  mobileCollapse = false,
}: TabNavProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || items[0]?.value);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  const currentValue = value ?? activeTab;

  // Variant styles
  const variantStyles = {
    default: 'bg-slate-900/50 border border-gold/30',
    pills: 'bg-transparent gap-2',
    underline: 'bg-transparent border-b border-slate-700',
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  // Determine grid columns dynamically
  const getGridCols = () => {
    if (!fullWidth) return '';
    if (items.length <= 2) return 'grid-cols-2';
    if (items.length <= 5) return `grid-cols-${items.length}`;
    return 'grid-cols-6';
  };

  const tabsListClassName = cn(
    // Base styles
    fullWidth ? `grid w-full ${getGridCols()}` : 'inline-flex w-full min-w-max',
    // Variant styles
    variantStyles[variant],
    // Responsive
    'text-xs sm:text-sm',
    // Mobile handling
    mobileCollapse && isMobile && 'flex-col',
    className
  );

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className={tabsListClassName}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              sizeStyles[size],
              variant === 'pills' && 'rounded-full',
              'flex items-center gap-2',
              'data-[state=active]:bg-gold/20 data-[state=active]:text-gold data-[state=active]:border-gold/50',
              variant === 'underline' && 'border-b-2 border-transparent data-[state=active]:border-gold',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gold/20 text-gold rounded-full">
                {item.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}

// Export TabsContent for use with TabNav
export { TabsContent } from '@/components/ui/tabs';

