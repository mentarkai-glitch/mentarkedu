"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Bell, 
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";

interface ReminderPreferencesProps {
  arkId?: string;
  taskId?: string;
}

export function ReminderPreferences({ arkId, taskId }: ReminderPreferencesProps) {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    whatsapp: false,
    inApp: true,
    dailySummary: true,
    weeklyReport: false
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    
    // Save preferences (would call API)
    try {
      // await savePreferences(newPrefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Reminder Preferences
        </CardTitle>
        <CardDescription className="text-slate-400">
          Choose how you want to receive reminders and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Channels */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Notification Channels</h4>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-xs text-slate-400">Receive reminders via email</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.email}
              onCheckedChange={(checked) => {
                if (checked !== preferences.email) handleToggle('email');
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-xs text-slate-400">Browser and mobile push notifications</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.push}
              onCheckedChange={(checked) => {
                if (checked !== preferences.push) handleToggle('push');
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">WhatsApp</p>
                <p className="text-xs text-slate-400">High-priority reminders only</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.whatsapp}
              onCheckedChange={(checked) => {
                if (checked !== preferences.whatsapp) handleToggle('whatsapp');
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">In-App</p>
                <p className="text-xs text-slate-400">Notifications within the app</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.inApp}
              onCheckedChange={() => {}}
              disabled
            />
            <Badge className="bg-slate-700/50 text-slate-300 text-xs">Always On</Badge>
          </div>
        </div>

        {/* Summary Preferences */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Summary Reports</h4>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">Daily Summary</p>
                <p className="text-xs text-slate-400">Get a summary of your progress each day</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.dailySummary}
              onCheckedChange={(checked) => {
                if (checked !== preferences.dailySummary) handleToggle('dailySummary');
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Weekly Report</p>
                <p className="text-xs text-slate-400">Comprehensive weekly progress report</p>
              </div>
            </div>
            <Checkbox
              checked={preferences.weeklyReport}
              onCheckedChange={(checked) => {
                if (checked !== preferences.weeklyReport) handleToggle('weeklyReport');
              }}
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300">
            💡 <strong>Smart Reminders:</strong> High-value tasks automatically get more reminder channels. 
            Critical tasks may include SMS/WhatsApp notifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


