import { useEffect, useState } from "react";

export interface UseOnlineStatusOptions {
  defaultStatus?: boolean;
  onChange?: (status: boolean) => void;
}

export function useOnlineStatus(options: UseOnlineStatusOptions = {}): boolean {
  const { defaultStatus = true, onChange } = options;
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return defaultStatus;
    }
    return window.navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleChange = () => {
      const nextStatus = window.navigator.onLine;
      setIsOnline(nextStatus);
      onChange?.(nextStatus);
    };

    window.addEventListener("online", handleChange);
    window.addEventListener("offline", handleChange);

    // Sync initial value in case of hydration mismatch
    handleChange();

    return () => {
      window.removeEventListener("online", handleChange);
      window.removeEventListener("offline", handleChange);
    };
  }, [onChange]);

  return isOnline;
}

