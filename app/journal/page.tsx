"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Upload, 
  BookOpen, 
  Image as ImageIcon,
  Calendar,
  Heart,
  Brain,
  Eye,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { ImageUploadButton } from "@/components/chat/ImageUploadButton";

interface JournalEntry {
  id: string;
  title: string;
  image_url: string;
  extracted_text: string;
  ai_insights: string[];
  emotion_detected: string;
  confidence_score: number;
  created_at: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load journal entries
  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the API
      // For now, we'll show a message that no entries exist
      setEntries([]);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalUpload = async (file: File) => {
    setUploading(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Remove data URL prefix
      const base64Data = base64.split(',')[1];

      // Analyze journal
      const response = await fetch("/api/vision/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          title: "Journal Entry",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create new entry
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          title: "Journal Entry",
          image_url: base64,
          extracted_text: data.data.extracted_text || "",
          ai_insights: data.data.insights || [],
          emotion_detected: data.data.emotion_detected || "neutral",
          confidence_score: data.data.confidence_score || 0.5,
          created_at: new Date().toISOString(),
        };

        setEntries(prev => [newEntry, ...prev]);
        setIsDialogOpen(false);
      } else {
        throw new Error(data.error || "Failed to analyze journal");
      }
    } catch (error) {
      console.error("Journal upload error:", error);
      alert("Failed to upload journal entry. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'joy': return 'text-green-500 bg-green-500/10';
      case 'sadness': return 'text-blue-500 bg-blue-500/10';
      case 'anger': return 'text-red-500 bg-red-500/10';
      case 'fear': return 'text-purple-500 bg-purple-500/10';
      case 'surprise': return 'text-yellow-500 bg-yellow-500/10';
      case 'trust': return 'text-cyan-500 bg-cyan-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-yellow-500/20 glass backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:bg-yellow-500/10 border-yellow-500/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-yellow-500" />
              <span className="font-display text-xl font-bold text-white">
                My Journal
              </span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-cyan-blue hover:opacity-90 text-black font-semibold neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md glass border-yellow-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Journal Entry</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                  Upload a photo of your handwritten notes, thoughts, or journal entry. 
                  AI will analyze the content and provide insights.
                </p>
                
                <ImageUploadButton 
                  onImageUpload={handleJournalUpload}
                  disabled={uploading}
                />
                
                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mr-2" />
                    <span className="text-slate-300">Analyzing your journal entry...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Journal Entries Yet</h3>
            <p className="text-slate-400 mb-6">
              Start your journaling journey by uploading your first entry.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-cyan-blue hover:opacity-90 text-black font-semibold neon-glow"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload First Entry
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="glass border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Image Preview */}
                        <div className="relative">
                          <img
                            src={entry.image_url}
                            alt="Journal entry"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Badge className={`absolute top-2 right-2 ${getEmotionColor(entry.emotion_detected)}`}>
                            {entry.emotion_detected}
                          </Badge>
                        </div>

                        {/* Entry Info */}
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                            {entry.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Extracted Text Preview */}
                        {entry.extracted_text && (
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {entry.extracted_text.substring(0, 100)}...
                          </p>
                        )}

                        {/* Insights Count */}
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-yellow-400" />
                          <span className="text-xs text-slate-400">
                            {entry.ai_insights.length} insights
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedEntry.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image */}
                <div className="relative">
                  <img
                    src={selectedEntry.image_url}
                    alt="Journal entry"
                    className="w-full h-auto rounded-lg border border-slate-600"
                  />
                </div>

                {/* Emotion Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300">Detected Emotion:</span>
                  <Badge className={getEmotionColor(selectedEntry.emotion_detected)}>
                    {selectedEntry.emotion_detected}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    ({(selectedEntry.confidence_score * 100).toFixed(0)}% confidence)
                  </span>
                </div>

                {/* Extracted Text */}
                {selectedEntry.extracted_text && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Extracted Text
                    </h4>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-200 whitespace-pre-wrap">
                        {selectedEntry.extracted_text}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Insights
                  </h4>
                  <div className="space-y-2">
                    {selectedEntry.ai_insights.map((insight, index) => (
                      <div key={index} className="bg-slate-700/50 p-3 rounded-lg">
                        <p className="text-slate-200">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created on {new Date(selectedEntry.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedEntry.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

