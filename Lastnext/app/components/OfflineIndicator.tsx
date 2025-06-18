'use client';

import { useOnlineStatus } from './ServiceWorkerRegistration';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          You are currently offline. Some features may be limited.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function OnlineIndicator() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-green-200 bg-green-50">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          You are back online!
        </AlertDescription>
      </Alert>
    </div>
  );
} 