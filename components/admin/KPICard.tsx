"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  gradient: string;
  iconColor: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  gradient,
  iconColor 
}: KPICardProps) {
  const trendColor = trend && trend.value > 0 ? 'text-green-400' : 
                     trend && trend.value < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {trend && (
            <Badge className={`${trendColor === 'text-green-400' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
              <span className={trendColor}>
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </Badge>
          )}
        </div>
        
        <div>
          <div className="text-3xl font-bold text-white mb-1">
            {value}
          </div>
          <div className="text-sm text-gray-400">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

