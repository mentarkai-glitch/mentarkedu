'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { NEETResult, RankImprovement } from '@/lib/utils/neet-scoring';
import { toast } from 'sonner';

interface MockTestScorecard {
  id: string;
  date: string;
  physics: number;
  chemistry: number;
  biology: number;
  total: number;
  rank?: number;
}

interface MockTestUploadProps {
  quizResult: NEETResult;
}

export function MockTestUpload({ quizResult }: MockTestUploadProps) {
  const [uploadedTests, setUploadedTests] = useState<MockTestScorecard[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For demo: Simulate parsing scorecard
    // In production, this would use OCR or manual input form
    setIsUploading(true);
    toast.loading('Parsing your scorecard...', { id: 'uploading' });

    // Simulate API call
    setTimeout(() => {
      // Mock parsed data - In production, parse from file/input
      const mockTest: MockTestScorecard = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        physics: 120,
        chemistry: 140,
        biology: 180,
        total: 440,
        rank: 85000
      };

      setUploadedTests(prev => [...prev, mockTest]);
      setIsUploading(false);
      toast.success('Scorecard uploaded successfully!', { id: 'uploading' });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };

  const handleManualInput = () => {
    // For demo: Show manual input form
    // In production, open a modal with input fields
    toast.info('Manual input feature coming soon! For now, use the upload feature.');
  };

  const removeTest = (id: string) => {
    setUploadedTests(prev => prev.filter(test => test.id !== id));
    toast.success('Scorecard removed');
  };

  // Calculate accuracy of quiz predictions
  const calculatePredictionAccuracy = (actualTests: MockTestScorecard[]) => {
    if (actualTests.length === 0) return null;

    const predictedScore = quizResult.rankImprovement.currentScore;
    const latestActualScore = actualTests[actualTests.length - 1].total;
    const scoreDifference = Math.abs(predictedScore - latestActualScore);
    const accuracyPercentage = Math.max(0, 100 - (scoreDifference / 7.2)); // 7.2 marks = 1%

    return {
      predictedScore,
      actualScore: latestActualScore,
      difference: latestActualScore - predictedScore,
      accuracy: Math.round(accuracyPercentage)
    };
  };

  const predictionAccuracy = calculatePredictionAccuracy(uploadedTests);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="h-5 w-5 text-teal-400" />
          📤 Upload Mock Test Scorecards
        </CardTitle>
        <CardDescription>
          Upload your recent mock test scorecards to compare quiz predictions vs actual performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upload Your Mock Test Scorecards
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload up to 3 recent mock test scorecards (PDF, image, or enter manually)
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="scorecard-upload"
              disabled={isUploading || uploadedTests.length >= 3}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || uploadedTests.length >= 3}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Scorecard'}
            </Button>
            <Button
              variant="outline"
              onClick={handleManualInput}
              disabled={uploadedTests.length >= 3}
            >
              <FileText className="h-4 w-4 mr-2" />
              Enter Manually
            </Button>
          </div>
          {uploadedTests.length >= 3 && (
            <p className="text-xs text-yellow-400 mt-4">
              Maximum 3 scorecards allowed. Remove one to upload another.
            </p>
          )}
        </div>

        {/* Uploaded Tests List */}
        {uploadedTests.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-400" />
              Uploaded Scorecards ({uploadedTests.length}/3)
            </h4>
            <div className="space-y-3">
              {uploadedTests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {test.date}
                      </Badge>
                      <span className="text-lg font-bold text-foreground">{test.total}/720</span>
                      {test.rank && (
                        <span className="text-sm text-muted-foreground">Rank: ~{test.rank.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Physics: {test.physics}</span>
                      <span>Chemistry: {test.chemistry}</span>
                      <span>Biology: {test.biology}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTest(test.id)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Analytics - Key Selling Point */}
        {predictionAccuracy && (
          <div className="pt-6 border-t border-border">
            <div className="p-6 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30">
              <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-400" />
                📊 Quiz Prediction vs Actual Performance
              </h4>
              <p className="text-sm text-muted-foreground mb-6">
                See how accurate our AI-powered diagnostic was compared to your actual mock test performance!
              </p>

              {/* Comparison Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Quiz Prediction</p>
                  <p className="text-2xl font-bold text-blue-400">{predictionAccuracy.predictedScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">/720 marks</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Actual Score</p>
                  <p className="text-2xl font-bold text-green-400">{predictionAccuracy.actualScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">/720 marks</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Prediction Accuracy</p>
                  <p className="text-2xl font-bold text-teal-400">{predictionAccuracy.accuracy}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.abs(predictionAccuracy.difference)} marks difference
                  </p>
                </div>
              </div>

              {/* Difference Indicator */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border mb-4">
                <div className="flex items-center gap-3">
                  {predictionAccuracy.difference > 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm font-semibold text-green-400">
                          You scored {predictionAccuracy.difference} marks HIGHER than predicted!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Great job! Your actual performance is better than initial assessment.
                        </p>
                      </div>
                    </>
                  ) : predictionAccuracy.difference < 0 ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-400">
                          You scored {Math.abs(predictionAccuracy.difference)} marks LOWER than predicted.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focus on the recommended action plan to improve your performance.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-blue-400">
                          Prediction matches your actual performance!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Our diagnostic accurately assessed your preparation level.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Performance Insights */}
              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <p className="text-sm font-semibold text-teal-400 mb-2">💡 Insight for Coaching Centers</p>
                <p className="text-xs text-muted-foreground">
                  This comparison feature demonstrates the accuracy of our diagnostic tool. 
                  By comparing quiz predictions with actual mock test scores, you can validate the AI's assessment 
                  and identify students who need immediate intervention. Upload multiple scorecards to track improvement trends!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis (if multiple tests) */}
        {uploadedTests.length >= 2 && (
          <div className="pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-4">📈 Performance Trend</h4>
            <div className="space-y-3">
              {uploadedTests.map((test, idx) => {
                const previousTest = idx > 0 ? uploadedTests[idx - 1] : null;
                const improvement = previousTest ? test.total - previousTest.total : 0;
                
                return (
                  <div key={test.id} className="flex items-center gap-4">
                    <div className="w-24 text-xs text-muted-foreground">{test.date}</div>
                    <Progress value={(test.total / 720) * 100} className="flex-1 h-3" />
                    <div className="w-20 text-right">
                      <span className="text-sm font-bold text-foreground">{test.total}</span>
                      {improvement !== 0 && (
                        <span className={`text-xs ml-2 ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {improvement > 0 ? '+' : ''}{improvement}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

