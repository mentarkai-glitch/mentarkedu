"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

interface PlanComparisonProps {
  currentPlan: 'neuro' | 'quantum';
  onSelectPlan: (plan: 'neuro' | 'quantum') => void;
}

export function PlanComparison({ currentPlan, onSelectPlan }: PlanComparisonProps) {
  const plans = {
    neuro: {
      name: 'Neuro',
      price: 8999,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Unlimited ARKs',
        'Daily motivation & focus analytics',
        'Core AI mentor',
        'Basic dashboard',
        'Email support',
        'Student onboarding',
        'Progress tracking'
      ]
    },
    quantum: {
      name: 'Quantum',
      price: 11999,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'All Neuro features',
        'Emotion graph & burnout prediction',
        'Custom AI personas',
        'Hybrid human-AI mentorship',
        'Advanced analytics',
        'Priority support',
        'Career DNA mapping',
        'Peer matching system',
        'Gamification (XP, badges, leaderboards)',
        'ARK templates',
        'Teacher interventions',
        'Real-time notifications'
      ]
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(plans).map(([key, plan]) => {
        const isCurrentPlan = currentPlan === key;
        
        return (
          <Card 
            key={key}
            className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all relative ${
              isCurrentPlan ? 'ring-2 ring-cyan-400' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">{plan.name.charAt(0)}</span>
              </div>
              <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-white mb-1">
                ₹{plan.price.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">per student/year</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {isCurrentPlan ? (
                <Button disabled className="w-full bg-slate-700 text-gray-400 cursor-not-allowed">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => onSelectPlan(key as 'neuro' | 'quantum')}
                  className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`}
                >
                  {currentPlan === 'neuro' ? 'Upgrade' : 'Downgrade'} to {plan.name}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

