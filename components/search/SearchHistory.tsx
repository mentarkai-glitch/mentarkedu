'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Trash2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchHistoryItem {
  id: string;
  query: string;
  context?: string;
  filters?: any;
  resultsCount?: number;
  searchedAt: string;
}

interface SearchHistoryProps {
  onSelectHistory?: (item: SearchHistoryItem) => void;
  days?: number;
  limit?: number;
}

export function SearchHistory({ onSelectHistory, days = 30, limit = 50 }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<Record<string, SearchHistoryItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [days, limit]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        days: days.toString(),
      });

      const response = await fetch(`/api/search/history?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }

      const result = await response.json();
      
      if (result.success) {
        setHistory(result.data.history || []);
        setGroupedByDate(result.data.groupedByDate || {});
      } else {
        throw new Error(result.error || 'Failed to load history');
      }
    } catch (err: any) {
      console.error('Search history error:', err);
      setError(err.message || 'Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async (clearAll: boolean = false) => {
    try {
      const params = new URLSearchParams();
      if (clearAll) params.append('all', 'true');

      const response = await fetch(`/api/search/history?${params}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHistory([]);
        setGroupedByDate({});
        toast.success(clearAll ? 'History cleared' : 'Old history cleared');
      } else {
        throw new Error('Failed to clear history');
      }
    } catch (err: any) {
      console.error('Clear history error:', err);
      toast.error('Failed to clear history');
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Search History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <History className="w-5 h-5" />
              Search History
            </CardTitle>
            <CardDescription>
              {history.length} search{history.length !== 1 ? 'es' : ''} in the last {days} days
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearHistory(false)}
              className="text-xs"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={fetchHistory} 
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {history.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No search history</p>
            <p className="text-xs text-slate-500">
              Your recent searches will appear here
            </p>
          </div>
        )}

        {Object.keys(groupedByDate).length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    {date}
                  </p>
                  <Badge variant="outline" className="text-xs bg-slate-700/50">
                    {items.length}
                  </Badge>
                </div>
                <div className="space-y-2 ml-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                      onClick={() => onSelectHistory?.(item)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Search className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                            <p className="text-sm text-white font-medium line-clamp-1">
                              {item.query}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 ml-5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.searchedAt).toLocaleTimeString()}
                            </span>
                            {item.resultsCount !== undefined && (
                              <>
                                <span>•</span>
                                <span>{item.resultsCount} results</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && Object.keys(groupedByDate).length === 0 && (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer"
                onClick={() => onSelectHistory?.(item)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-3 h-3 text-yellow-400" />
                  <p className="text-sm text-white font-medium line-clamp-1">
                    {item.query}
                  </p>
                </div>
                <p className="text-xs text-slate-500 ml-5">
                  {new Date(item.searchedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}





