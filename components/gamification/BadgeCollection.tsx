"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Lock, Check } from "lucide-react";

interface BadgeData {
  id: string;
  type: string;
  title: string;
  description: string;
  icon_url: string;
  earned_at?: string;
  is_seen?: boolean;
}

interface BadgeCollectionProps {
  earned: BadgeData[];
  available: BadgeData[];
  totalEarned: number;
  totalAvailable: number;
  className?: string;
}

export function BadgeCollection({ 
  earned, 
  available, 
  totalEarned, 
  totalAvailable, 
  className 
}: BadgeCollectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  const BadgeCard = ({ badge, isEarned }: { badge: BadgeData; isEarned: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        isEarned 
          ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30 hover:border-yellow-400/50' 
          : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
      }`}
      onClick={() => setSelectedBadge(badge)}
    >
      <CardContent className="p-4 text-center">
        <div className="relative mb-3">
          <div className={`text-4xl ${isEarned ? 'animate-pulse' : 'opacity-50'}`}>
            {badge.icon_url}
          </div>
          {isEarned && (
            <div className="absolute -top-1 -right-1">
              <Check className="h-4 w-4 text-green-400" />
            </div>
          )}
          {!isEarned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
        
        <h4 className={`font-semibold text-sm mb-1 ${isEarned ? 'text-white' : 'text-gray-400'}`}>
          {badge.title}
        </h4>
        
        <p className={`text-xs ${isEarned ? 'text-gray-300' : 'text-gray-500'}`}>
          {badge.description}
        </p>
        
        {isEarned && badge.earned_at && (
          <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
            Earned {new Date(badge.earned_at).toLocaleDateString()}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>Badge Collection</span>
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              {totalEarned}/{totalAvailable}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="earned" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="earned" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Earned ({totalEarned})</span>
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Available ({totalAvailable})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="earned" className="mt-4">
              {earned.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No badges earned yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete ARKs, maintain streaks, and engage with your mentor to earn badges!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earned.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} isEarned={true} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {available.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} isEarned={false} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">
                  {selectedBadge.icon_url}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedBadge.title}
                </h3>
                <p className="text-gray-300 mb-4">
                  {selectedBadge.description}
                </p>
                
                {selectedBadge.earned_at ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Earned on {new Date(selectedBadge.earned_at).toLocaleDateString()}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    Not yet earned
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
