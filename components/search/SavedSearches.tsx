'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  BookmarkCheck,
  Trash2,
  Search,
  Clock,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedSearch {
  id: string;
  query: string;
  context?: string;
  filters?: any;
  savedAt: string;
  lastUsedAt?: string;
  useCount?: number;
}

interface SavedSearchesProps {
  onSelectSearch?: (search: SavedSearch) => void;
  compact?: boolean;
}

export function SavedSearches({ onSelectSearch, compact = false }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get saved searches
      const response = await fetch('/api/search/save', { credentials: 'include' });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.savedSearches) {
          setSavedSearches(result.data.savedSearches || []);
        }
      } else {
        throw new Error('Failed to fetch saved searches');
      }
    } catch (err: any) {
      console.error('Failed to fetch saved searches:', err);
      setError(err.message || 'Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/search/save?id=${encodeURIComponent(searchId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
          toast.success('Search removed');
          // Refresh the list
          fetchSavedSearches();
        } else {
          throw new Error(result.error || 'Failed to remove search');
        }
      } else {
        throw new Error('Failed to remove search');
      }
    } catch (err: any) {
      console.error('Remove search error:', err);
      toast.error('Failed to remove search');
    }
  };

  const saveCurrentSearch = async (query: string, context?: string) => {
    if (!query.trim()) {
      toast.error('Enter a search query to save');
      return;
    }

    try {
      const response = await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query, context }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedSearches((prev) => [result.data.search, ...prev]);
          toast.success('Search saved');
          // Refresh the list to ensure consistency
          fetchSavedSearches();
        }
      } else {
        const error = await response.json();
        if (error.error?.includes('already saved')) {
          toast.info('Search already saved');
        } else {
          throw new Error(error.error || 'Failed to save search');
        }
      }
    } catch (err: any) {
      console.error('Save search error:', err);
      toast.error(err.message || 'Failed to save search');
    }
  };

  if (loading && !compact) {
    return (
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Saved Searches</CardTitle>
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

  if (compact) {
    return (
      <div className="space-y-2">
        {savedSearches.slice(0, 5).map((search) => (
          <div
            key={search.id}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
            onClick={() => onSelectSearch?.(search)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium line-clamp-1 mb-1">
                  {search.query}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {search.lastUsedAt && (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Used {new Date(search.lastUsedAt).toLocaleDateString()}</span>
                    </>
                  )}
                  {search.useCount && search.useCount > 1 && (
                    <>
                      <span>•</span>
                      <span>{search.useCount}x</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSavedSearch(search.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
        {savedSearches.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">No saved searches</p>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center gap-2">
          <BookmarkCheck className="w-5 h-5" />
          Saved Searches
        </CardTitle>
        <CardDescription>
          {savedSearches.length} saved search{savedSearches.length !== 1 ? 'es' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={fetchSavedSearches} 
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {savedSearches.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">No saved searches yet</p>
            <p className="text-xs text-slate-500">
              Save searches for quick access later
            </p>
          </div>
        )}

        {savedSearches.length > 0 && (
          <div className="space-y-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group"
                onClick={() => onSelectSearch?.(search)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <p className="text-sm text-white font-medium line-clamp-2">
                        {search.query}
                      </p>
                    </div>
                    {search.context && (
                      <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                        Context: {search.context}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Saved {new Date(search.savedAt).toLocaleDateString()}</span>
                      {search.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span>Last used {new Date(search.lastUsedAt).toLocaleDateString()}</span>
                        </>
                      )}
                      {search.useCount && search.useCount > 1 && (
                        <>
                          <span>•</span>
                          <span>Used {search.useCount} times</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedSearch(search.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

