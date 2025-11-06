"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Heart, Star, MessageCircle, UserPlus, RefreshCw } from "lucide-react";

interface PeerMatch {
  student_id: string;
  name: string;
  avatar?: string;
  grade: string;
  interests: string[];
  goals: string[];
  compatibility_score: number;
  match_type: string;
  factors: string[];
}

interface PeerMatchesProps {
  className?: string;
}

export function PeerMatches({ className }: PeerMatchesProps) {
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const findMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/peer-matching/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: {} })
      });
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.data.matches);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'study_buddy':
        return <Users className="h-4 w-4 text-blue-400" />;
      case 'complementary':
        return <Heart className="h-4 w-4 text-pink-400" />;
      case 'similar_interests':
        return <Star className="h-4 w-4 text-yellow-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'study_buddy':
        return 'Study Buddy';
      case 'complementary':
        return 'Complementary';
      case 'similar_interests':
        return 'Similar Interests';
      default:
        return 'Match';
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'study_buddy':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'complementary':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'similar_interests':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.6) return "text-yellow-400";
    if (score >= 0.4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Users className="h-6 w-6 text-blue-400" />
            <span>Peer Matches</span>
          </CardTitle>
          <Button
            onClick={findMatches}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            {hasSearched ? 'Find New Matches' : 'Find Matches'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasSearched ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">Ready to find your study buddies?</p>
            <p className="text-sm text-gray-500 mb-4">
              We&apos;ll match you with students who share similar interests, goals, and career aspirations
            </p>
            <Button 
              onClick={findMatches}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Find My Matches
                </>
              )}
            </Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No matches found</p>
            <p className="text-sm text-gray-500">
              Try updating your profile or check back later for new students
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.student_id}
                className="p-4 rounded-lg bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {match.avatar ? (
                      <img
                        src={match.avatar}
                        alt={match.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {match.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{match.name}</h4>
                        <p className="text-sm text-gray-400">Grade {match.grade}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getCompatibilityColor(match.compatibility_score)}`}>
                          {Math.round(match.compatibility_score * 100)}%
                        </div>
                        <Badge className={`text-xs ${getMatchTypeColor(match.match_type)}`}>
                          {getMatchTypeIcon(match.match_type)}
                          <span className="ml-1">{getMatchTypeLabel(match.match_type)}</span>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-300 mb-1">
                          <strong>Interests:</strong> {match.interests.join(', ')}
                        </p>
                        <p className="text-sm text-gray-300">
                          <strong>Goals:</strong> {match.goals.join(', ')}
                        </p>
                      </div>
                      
                      {match.factors.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Why you match:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.factors.map((factor, index) => (
                              <Badge 
                                key={index}
                                variant="outline" 
                                className="text-xs border-gray-600 text-gray-400"
                              >
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-4 border-t border-gray-700">
              <Button 
                onClick={findMatches}
                disabled={loading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Find More Matches
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
