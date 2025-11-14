'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  Building2,
  GraduationCap,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Download,
  Share2,
  Wifi,
  WifiOff,
  Upload,
  FileCheck,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Course {
  id: string;
  name: string;
  degree: string;
}

interface FormData {
  filled_data: any;
  career_guidance: any;
  required_documents: string[];
  ai_recommendations: string[];
}

const FORM_STORAGE_KEY = 'mentark-form-filler-selection-v1';
const HISTORY_STORAGE_KEY = 'mentark-form-filler-history-v1';
const MAX_HISTORY = 5;

export default function FormFillerPage() {
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<Array<{ collegeId: string; courseId: string; timestamp: string }>>([]);
  const [exporting, setExporting] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    text?: string;
    form_fields?: Record<string, string | boolean>;
  } | null>(null);

  useEffect(() => {
    loadColleges();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FORM_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { collegeId: string; courseId: string };
          setSelectedCollege(parsed.collegeId || '');
          setSelectedCourse(parsed.courseId || '');
        }
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.warn('Failed to restore form filler state', err);
      }
      const updateStatus = () => setIsOnline(navigator.onLine);
      updateStatus();
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
      return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
      };
    }
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      loadCourses();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({ collegeId: selectedCollege, courseId: selectedCourse })
      );
    }
  }, [selectedCollege]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({ collegeId: selectedCollege, courseId: selectedCourse })
      );
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  const loadColleges = async () => {
    try {
      const response = await fetch('/api/colleges/search?limit=50');
      const data = await response.json();
      if (data.success) {
        setColleges(data.data.colleges || []);
      }
    } catch (error) {
      console.error('Error loading colleges:', error);
    }
  };

  const loadCourses = async () => {
    if (!isOnline) return;
    try {
      const response = await fetch(`/api/colleges/${selectedCollege}/courses`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    }
  };

  const handleFillForm = async () => {
    if (!selectedCollege || !selectedCourse) {
      setError('Please select both college and course');
      return;
    }
    if (!isOnline) {
      setError('You appear to be offline. Reconnect to generate form data.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const profileResponse = await fetch('/api/students/profile');
      const profileData = await profileResponse.json();
      
      if (!profileData.success || !profileData.data) {
        setError('Please complete your profile first');
        setLoading(false);
        return;
      }

      const studentId = profileData.data.user_id;

      const response = await fetch('/api/agents/form-filler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_id: selectedCollege,
          course_id: selectedCourse,
          student_id: studentId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
        setHistory((prev) => [
          { collegeId: selectedCollege, courseId: selectedCourse, timestamp: new Date().toISOString() },
          ...prev.filter((item) => !(item.collegeId === selectedCollege && item.courseId === selectedCourse)),
        ].slice(0, MAX_HISTORY));
        toast.success('Form data ready');
      } else {
        setError(data.message || 'Failed to generate form data');
      }
    } catch (error) {
      console.error('Form fill error:', error);
      setError('Failed to fill form. Please try again.');
      toast.error('Unable to generate form data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!formData) {
      toast.info('No form data yet', {
        description: 'Generate a form before exporting.',
      });
      return;
    }
    setExporting(true);
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        college: colleges.find((c) => c.id === selectedCollege)?.name,
        course: courses.find((c) => c.id === selectedCourse)?.name,
        data: formData,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'mentark-form-filler.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export ready', {
        description: 'Form helper JSON saved to your downloads.',
      });
    } catch (err) {
      console.error('Export form data error', err);
      toast.error('Export failed', {
        description: 'Please retry after checking your connection.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Form data will be cached until you reconnect."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <ClipboardCheck className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Form Filler
                </h1>
                <p className="text-slate-400">AI-powered college admission form assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected to form services</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; selections are saved locally</span>
                </>
              )}
            </div>
          </div>

          {/* Selection Form */}
          <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Select Your Target</CardTitle>
              <CardDescription>Choose a college and course to auto-fill admission forms, or upload a document to extract data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.length > 0 && (
                <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                  <span>Recent runs:</span>
                  {history.map((item) => (
                    <Badge key={item.timestamp} variant="outline" className="text-slate-300">
                      {new Date(item.timestamp).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    College
                  </label>
                  <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select college...">
                        {colleges.find(c => c.id === selectedCollege)?.name || 'Select college...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}, {college.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    Course
                  </label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedCollege}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select course...">
                        {courses.find(c => c.id === selectedCourse)?.name || 'Select course...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} - {course.degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <label className="text-sm font-medium mb-2 block text-slate-300">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Upload Document (Optional)
                </label>
                <div className="space-y-3">
                  {!uploadedDocument ? (
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-yellow-500/50 transition-colors">
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Validate file type
                          const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/bmp'];
                          if (!allowedTypes.includes(file.type)) {
                            toast.error('Invalid file type. Supported: PDF, PNG, JPEG, TIFF, BMP');
                            return;
                          }
                          
                          // Validate file size (20MB)
                          if (file.size > 20 * 1024 * 1024) {
                            toast.error('File size exceeds 20MB limit');
                            return;
                          }
                          
                          setUploadedDocument(file);
                          setUploading(true);
                          setExtractedData(null);
                          
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('processorType', 'form-parser'); // Use form parser for better extraction
                            
                            const response = await fetch('/api/vision/upload-document', {
                              method: 'POST',
                              body: formData,
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                              setExtractedData({
                                text: data.data.extracted_text,
                                form_fields: data.data.form_fields,
                              });
                              toast.success('Document processed successfully');
                              
                              // Auto-fill form if we have form fields
                              if (data.data.form_fields && Object.keys(data.data.form_fields).length > 0) {
                                // We'll use this data to enhance form filling
                                toast.info('Extracted form fields ready for auto-fill');
                              }
                            } else {
                              toast.error(data.message || 'Failed to process document');
                              setUploadedDocument(null);
                            }
                          } catch (error) {
                            console.error('Document upload error:', error);
                            toast.error('Failed to upload document');
                            setUploadedDocument(null);
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-slate-500">
                          PDF, PNG, JPEG (max 20MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{uploadedDocument.name}</p>
                            <p className="text-xs text-slate-400">
                              {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploading && (
                            <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedDocument(null);
                              setExtractedData(null);
                            }}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {extractedData && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          {extractedData.form_fields && Object.keys(extractedData.form_fields).length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-slate-400">Extracted Form Fields:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(extractedData.form_fields).slice(0, 6).map(([key, value]) => (
                                  <div key={key} className="text-xs bg-slate-900/50 p-2 rounded">
                                    <span className="text-slate-500">{key}:</span>{' '}
                                    <span className="text-slate-300">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                              {Object.keys(extractedData.form_fields).length > 6 && (
                                <p className="text-xs text-slate-500">
                                  + {Object.keys(extractedData.form_fields).length - 6} more fields
                                </p>
                              )}
                            </div>
                          ) : extractedData.text ? (
                            <div>
                              <p className="text-xs text-slate-400 mb-2">Extracted Text:</p>
                              <p className="text-xs text-slate-300 line-clamp-3 bg-slate-900/50 p-2 rounded">
                                {extractedData.text.substring(0, 200)}...
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleFillForm}
                disabled={loading || !selectedCollege || !selectedCourse}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    Generating Form Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Form Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Form Data Display */}
          {!loading && formData && (
            <div className="space-y-6">
              {/* Personal & Academic Info */}
              {formData.filled_data && (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Form Data Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Name</p>
                        <p className="text-white">
                          {formData.filled_data.first_name} {formData.filled_data.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Email</p>
                        <p className="text-white">{formData.filled_data.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Phone</p>
                        <p className="text-white">{formData.filled_data.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Location</p>
                        <p className="text-white">
                          {formData.filled_data.city}, {formData.filled_data.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Exam Score</p>
                        <p className="text-white">{formData.filled_data.score || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Category</p>
                        <p className="text-white">{formData.filled_data.category || 'General'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Required Documents */}
              {formData.required_documents && formData.required_documents.length > 0 && (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.required_documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-white">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations */}
              {formData.ai_recommendations && formData.ai_recommendations.length > 0 && (
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.ai_recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <p className="text-sm text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator
                        .share({
                          title: 'Mentark Form Data',
                          text: 'AI-generated form plan ready to review.',
                        })
                        .catch(() => {});
                    } else {
                      toast('Share not supported on this device');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share Overview
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !formData && (
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <ClipboardCheck className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Fill Forms?</h3>
                    <p className="text-slate-400 text-sm">
                      Select a college and course above to generate AI-powered form data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
