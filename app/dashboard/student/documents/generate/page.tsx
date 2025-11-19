'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  CheckCircle,
  BookOpen,
  Briefcase,
  Award,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { generateDocument, downloadDocumentAsFile } from '@/lib/services/document-generation';
import Link from 'next/link';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  color: string;
}

const documentTypes: DocumentType[] = [
  {
    id: 'resume',
    name: 'Resume',
    description: 'Professional resume with your experience and skills',
    icon: <Briefcase className="w-6 h-6" />,
    formats: ['pdf', 'docx'],
    color: 'bg-blue-500',
  },
  {
    id: 'cover_letter',
    name: 'Cover Letter',
    description: 'Tailored cover letter for job applications',
    icon: <FileText className="w-6 h-6" />,
    formats: ['pdf', 'docx'],
    color: 'bg-purple-500',
  },
  {
    id: 'project_report',
    name: 'Project Report',
    description: 'Comprehensive project documentation and analysis',
    icon: <FileCode className="w-6 h-6" />,
    formats: ['pdf', 'docx'],
    color: 'bg-green-500',
  },
  {
    id: 'study_notes',
    name: 'Study Notes',
    description: 'Organized study notes from topics or conversations',
    icon: <BookOpen className="w-6 h-6" />,
    formats: ['pdf', 'docx'],
    color: 'bg-yellow-500',
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Printable flashcards from practice questions',
    icon: <Award className="w-6 h-6" />,
    formats: ['pdf', 'xlsx'],
    color: 'bg-pink-500',
  },
  {
    id: 'summary_sheet',
    name: 'Summary Sheet',
    description: 'Data summaries and analytics reports',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    formats: ['xlsx', 'pdf'],
    color: 'bg-indigo-500',
  },
];

export default function DocumentGeneratorPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<{ id: string; type: string } | null>(null);

  const selectedDocType = documentTypes.find(dt => dt.id === selectedType);

  const handleGenerate = async () => {
    if (!selectedType) {
      toast.error('Please select a document type');
      return;
    }

    setGenerating(true);
    try {
      // For now, use placeholder data
      // In real implementation, this would fetch data from the relevant source
      const result = await generateDocument({
        doc_type: selectedType,
        format: selectedFormat as 'pdf' | 'docx' | 'xlsx',
        data: {
          placeholder: true,
          message: `This is a placeholder for ${selectedType}. Integration with actual data sources coming soon.`,
        },
        options: {
          compress: true,
          s3_upload: false,
        },
      });

      toast.success(`${selectedDocType?.name} generated successfully!`);
      setLastGenerated({ id: result.id, type: selectedType });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!lastGenerated) {
      toast.error('No document to download');
      return;
    }

    try {
      await downloadDocumentAsFile(
        lastGenerated.id,
        `${selectedDocType?.name.toLowerCase().replace(' ', '-')}.${selectedFormat}`
      );
      toast.success('Document downloaded!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-400" />
            Document Generator
          </h1>
          <p className="text-slate-400">Generate professional documents from your Mentark data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Type Selection */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select Document Type</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose the type of document you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentTypes.map((docType) => (
                    <motion.div
                      key={docType.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedType === docType.id
                            ? 'bg-slate-700 border-purple-500'
                            : 'bg-slate-800/30 border-slate-600 hover:border-slate-500'
                        }`}
                        onClick={() => setSelectedType(docType.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`${docType.color} p-3 rounded-lg text-white`}>
                              {docType.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold mb-1">{docType.name}</h3>
                              <p className="text-slate-400 text-sm">{docType.description}</p>
                              <div className="flex gap-2 mt-2">
                                {docType.formats.map((format) => (
                                  <Badge
                                    key={format}
                                    variant="outline"
                                    className="text-xs border-slate-600 text-slate-300"
                                  >
                                    {format.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {selectedType === docType.id && (
                              <CheckCircle className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/student/resume-builder">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Resume Builder
                    </Button>
                  </Link>
                  <Link href="/dashboard/student/documents">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      My Documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generation Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generate Document</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure and generate your document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDocType && (
                  <>
                    <div>
                      <label className="text-slate-300 text-sm mb-2 block">Format</label>
                      <Select
                        value={selectedFormat}
                        onValueChange={setSelectedFormat}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDocType.formats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={generating || !selectedType}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Document
                        </>
                      )}
                    </Button>

                    {lastGenerated && lastGenerated.type === selectedType && (
                      <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Document ready</span>
                        </div>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {!selectedType && (
                  <p className="text-slate-400 text-sm text-center py-4">
                    Select a document type to get started
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Integration Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-400">
                <p>• Generate resumes from Job Matcher</p>
                <p>• Create project reports from Project Helper</p>
                <p>• Export flashcards from Practice Questions</p>
                <p>• Generate notes from Smart Search</p>
                <p>• Create ARK progress reports</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


