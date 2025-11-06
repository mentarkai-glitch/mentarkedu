'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ModelStats {
  avgDuration: number;
  avgQuality: number;
  successRate: number;
  totalCost: number;
  totalTokens: number;
  fallbackRate: number;
  totalRequests: number;
}

interface ModelComparisonTableProps {
  models: Record<string, ModelStats>;
}

export function ModelComparisonTable({ models }: ModelComparisonTableProps) {
  const modelNames = Object.keys(models);
  
  if (modelNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No model performance data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate averages for comparison
  const avgDuration = modelNames.reduce((sum, model) => sum + models[model].avgDuration, 0) / modelNames.length;
  const avgSuccessRate = modelNames.reduce((sum, model) => sum + models[model].successRate, 0) / modelNames.length;
  const avgCost = modelNames.reduce((sum, model) => sum + models[model].totalCost, 0) / modelNames.length;

  const getTrendIcon = (value: number, average: number) => {
    if (value > average * 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < average * 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPerformanceColor = (value: number, average: number, reverse = false) => {
    const isBetter = reverse ? value < average : value > average;
    if (isBetter) return 'text-green-600';
    if (Math.abs(value - average) / average < 0.1) return 'text-gray-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Avg Duration</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Fallback Rate</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelNames.map((model) => {
              const stats = models[model];
              return (
                <TableRow key={model}>
                  <TableCell className="font-medium">{model}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {stats.totalRequests}
                      {getTrendIcon(stats.totalRequests, modelNames.reduce((sum, m) => sum + models[m].totalRequests, 0) / modelNames.length)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getPerformanceColor(stats.successRate, avgSuccessRate)}`}>
                        {stats.successRate.toFixed(1)}%
                      </span>
                      {stats.successRate >= 95 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : stats.successRate < 80 ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getPerformanceColor(stats.avgDuration, avgDuration, true)}`}>
                        {stats.avgDuration.toFixed(0)}ms
                      </span>
                      {getTrendIcon(stats.avgDuration, avgDuration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getPerformanceColor(stats.totalCost, avgCost, true)}`}>
                        ${stats.totalCost.toFixed(4)}
                      </span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${stats.fallbackRate < 5 ? 'text-green-600' : stats.fallbackRate < 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stats.fallbackRate.toFixed(1)}%
                      </span>
                      {stats.fallbackRate < 5 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : stats.fallbackRate > 15 ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {stats.successRate >= 95 && stats.fallbackRate < 5 ? (
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      ) : stats.successRate >= 90 && stats.fallbackRate < 10 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
