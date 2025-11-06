'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface ModelHealth {
  model: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  lastCheck: string;
}

interface ModelHealthGridProps {
  health: ModelHealth[];
}

export function ModelHealthGrid({ health }: ModelHealthGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 1000) return 'text-green-600';
    if (responseTime <= 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {health.map((model) => (
        <Card key={model.model} className={`border-2 ${getStatusColor(model.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{model.model}</CardTitle>
              <div className="flex items-center gap-1">
                {getStatusIcon(model.status)}
                <Badge variant="outline" className="text-xs">
                  {model.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className={`font-semibold ${getUptimeColor(model.uptime)}`}>
                {model.uptime.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className={`font-semibold ${getResponseTimeColor(model.avgResponseTime)}`}>
                {model.avgResponseTime}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className={`font-semibold ${model.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {model.errorRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Last check: {new Date(model.lastCheck).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
