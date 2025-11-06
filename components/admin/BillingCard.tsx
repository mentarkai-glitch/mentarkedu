"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, Calendar, TrendingUp, Download, DollarSign } from "lucide-react";
import type { InstituteBilling } from "@/lib/types";

interface BillingCardProps {
  billing: InstituteBilling;
  actualStudentCount: number;
  pricing: {
    monthly: number;
    yearly: number;
    per_student: number;
    discount_percentage: number;
  };
  onUpgrade?: () => void;
  onDowngrade?: () => void;
}

export function BillingCard({ 
  billing, 
  actualStudentCount, 
  pricing,
  onUpgrade,
  onDowngrade 
}: BillingCardProps) {
  const isQuantum = billing.plan_type === 'quantum';
  const isYearly = billing.billing_cycle === 'yearly';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trial': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${
      isQuantum 
        ? 'from-purple-900/20 to-pink-900/20 border-purple-500/20' 
        : 'from-blue-900/20 to-cyan-900/20 border-blue-500/20'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-cyan-400" />
            <span>Current Plan</span>
          </CardTitle>
          <Badge className={getStatusColor(billing.status)}>
            {billing.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan Type */}
        <div className="text-center py-6 bg-slate-900/30 rounded-lg">
          <h3 className="text-3xl font-bold text-white mb-2">
            {billing.plan_type === 'quantum' ? 'Quantum' : 'Neuro'}
          </h3>
          <p className="text-gray-300 text-lg">
            ₹{pricing.per_student.toLocaleString()} per student/year
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Students</span>
            </div>
            <p className="text-2xl font-bold text-white">{actualStudentCount}</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">{isYearly ? 'Yearly' : 'Monthly'}</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ₹{(isYearly ? pricing.yearly : pricing.monthly).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="space-y-2 text-sm">
          {billing.next_billing_date && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Next Billing
              </span>
              <span className="text-white">
                {new Date(billing.next_billing_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {billing.last_payment_date && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Payment</span>
              <span className="text-white">
                {new Date(billing.last_payment_date).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {pricing.discount_percentage > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Discount</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {pricing.discount_percentage}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-slate-700">
          {!isQuantum && onUpgrade && (
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade to Quantum
            </Button>
          )}
          
          {isQuantum && onDowngrade && (
            <Button
              onClick={onDowngrade}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Downgrade to Neuro
            </Button>
          )}
          
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

