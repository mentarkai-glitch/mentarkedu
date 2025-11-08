import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  isOnline: boolean;
  message?: string;
  className?: string;
}

export function OfflineBanner({
  isOnline,
  message = "You appear to be offline. Changes will be saved locally until you reconnect.",
  className,
}: OfflineBannerProps) {
  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200",
        className
      )}
      role="status"
      data-testid="offline-banner"
    >
      <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{message}</span>
    </div>
  );
}

