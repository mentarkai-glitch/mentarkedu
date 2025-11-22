/**
 * Mobile responsiveness utilities and components
 */

import { cn } from "@/lib/utils";

/**
 * Responsive grid classes
 */
export const responsiveGrid = {
  // 1 column on mobile, 2 on tablet, 3+ on desktop
  cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  // 1 column on mobile, 2 on tablet, 4 on desktop
  cards4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  // 1 column on mobile, 2 on desktop
  cards2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  // Stats grid: 2 cols mobile, 3 cols tablet, 4+ desktop
  stats: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
};

/**
 * Responsive text sizes
 */
export const responsiveText = {
  h1: "text-2xl sm:text-3xl md:text-4xl font-bold",
  h2: "text-xl sm:text-2xl md:text-3xl font-semibold",
  h3: "text-lg sm:text-xl md:text-2xl font-semibold",
  body: "text-sm sm:text-base",
  small: "text-xs sm:text-sm",
};

/**
 * Responsive spacing
 */
export const responsiveSpacing = {
  container: "px-4 sm:px-6 lg:px-8",
  section: "py-4 sm:py-6 lg:py-8",
  card: "p-4 sm:p-6",
};

/**
 * Responsive button groups
 */
export const buttonGroup = {
  horizontal: "flex flex-col sm:flex-row gap-2 sm:gap-4",
  vertical: "flex flex-col gap-2",
  wrap: "flex flex-wrap gap-2",
};

/**
 * Responsive table wrapper
 */
export function ResponsiveTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto -mx-4 sm:mx-0", className)}>
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  );
}

/**
 * Responsive card grid
 */
export function ResponsiveCardGrid({ 
  children, 
  cols = 3,
  className 
}: { 
  children: React.ReactNode; 
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[cols], className)}>
      {children}
    </div>
  );
}

/**
 * Mobile-first button container
 */
export function ButtonGroup({ 
  children, 
  align = "left",
  className 
}: { 
  children: React.ReactNode;
  align?: "left" | "right" | "center" | "between";
  className?: string;
}) {
  const alignClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-2 sm:gap-4",
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
}

