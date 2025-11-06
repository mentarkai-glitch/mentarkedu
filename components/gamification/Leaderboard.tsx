"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  xp_total: number;
  level: number;
  students: {
    user_id: string;
    users: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedBatch]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBatch !== "all") params.append('batch', selectedBatch);
      
      const response = await fetch(`/api/gamification/leaderboard?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.data.leaderboard);
        setUserPosition(data.data.userPosition);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>Leaderboard</span>
          </CardTitle>
          
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No students found</p>
            <p className="text-sm text-gray-500 mt-1">
              Students will appear here as they start earning XP
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.students.user_id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:bg-gray-800/30 ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20' : 'bg-gray-900/30'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex-shrink-0">
                  {entry.students.users.avatar_url ? (
                    <img
                      src={entry.students.users.avatar_url}
                      alt={entry.students.users.full_name}
                      className="w-10 h-10 rounded-full border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {entry.students.users.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-white truncate">
                    {entry.students.users.full_name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getRankBadgeColor(entry.rank)}`}>
                      Level {entry.level}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {entry.xp_total.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                
                {entry.rank <= 3 && (
                  <div className="flex-shrink-0">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                )}
              </div>
            ))}
            
            {/* User Position (if not in top list) */}
            {userPosition && userPosition.rank > leaderboard.length && (
              <div className="border-t border-gray-700 pt-3 mt-4">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
                  <div className="flex items-center justify-center w-8">
                    <span className="text-sm font-semibold text-cyan-400">#{userPosition.rank}</span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">You</span>
                    </div>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-cyan-400">Your Position</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        Level {userPosition.level}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {userPosition.xp_total.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
