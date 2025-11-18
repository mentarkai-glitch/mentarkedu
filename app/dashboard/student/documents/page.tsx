'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Briefcase,
  BookOpen,
  Award,
  Calendar,
  File,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { listDocuments, downloadDocumentAsFile } from '@/lib/services/document-generation';
import Link from 'next/link';

interface Document {
  id: string;
  document_type: string;
  format: string;
  generated_at: string;
  template_used?: string;
  metadata?: any;
  views?: number;
  downloads?: number;
}

const documentTypeIcons: Record<string, React.ReactNode> = {
  resume: <Briefcase className="w-5 h-5" />,
  cover_letter: <FileText className="w-5 h-5" />,
  project_report: <FileCode className="w-5 h-5" />,
  study_notes: <BookOpen className="w-5 h-5" />,
  flashcards: <Award className="w-5 h-5" />,
  summary_sheet: <FileSpreadsheet className="w-5 h-5" />,
  ark_progress_report: <FileText className="w-5 h-5" />,
  ark_completion_report: <FileText className="w-5 h-5" />,
  ark_skills_report: <FileText className="w-5 h-5" />,
};

const documentTypeColors: Record<string, string> = {
  resume: 'bg-blue-500',
  cover_letter: 'bg-purple-500',
  project_report: 'bg-green-500',
  study_notes: 'bg-yellow-500',
  flashcards: 'bg-pink-500',
  summary_sheet: 'bg-indigo-500',
  ark_progress_report: 'bg-cyan-500',
  ark_completion_report: 'bg-emerald-500',
  ark_skills_report: 'bg-orange-500',
};

export default function DocumentsLibraryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');

  useEffect(() => {
    loadDocuments();
  }, [filterType, filterFormat]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await listDocuments({
        type: filterType !== 'all' ? filterType : undefined,
        format: filterFormat !== 'all' ? filterFormat : undefined,
        limit: 100,
      });
      setDocuments(result.documents || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      toast.loading('Downloading document...', { id: `download-${document.id}` });
      await downloadDocumentAsFile(
        document.id,
        `${document.document_type}-${new Date(document.generated_at).toISOString().split('T')[0]}.${document.format}`
      );
      toast.success('Document downloaded!', { id: `download-${document.id}` });
      
      // Reload to update download count
      await loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document', { id: `download-${document.id}` });
    }
  };

  const handlePreview = (document: Document) => {
    // Open preview in new tab
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const typeLabel = getDocumentTypeLabel(doc.document_type).toLowerCase();
        const metadataStr = JSON.stringify(doc.metadata || {}).toLowerCase();
        return (
          typeLabel.includes(query) ||
          doc.template_used?.toLowerCase().includes(query) ||
          metadataStr.includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime();
      } else {
        return a.document_type.localeCompare(b.document_type);
      }
    });

  const groupedByType = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10 text-purple-400" />
                My Documents
              </h1>
              <p className="text-slate-400">View and manage all your generated documents</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/student/documents/generate">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={loadDocuments}
                disabled={loading}
                className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  <SelectItem value="project_report">Project Report</SelectItem>
                  <SelectItem value="study_notes">Study Notes</SelectItem>
                  <SelectItem value="flashcards">Flashcards</SelectItem>
                  <SelectItem value="summary_sheet">Summary Sheet</SelectItem>
                  <SelectItem value="ark_progress_report">ARK Progress</SelectItem>
                  <SelectItem value="ark_completion_report">ARK Completion</SelectItem>
                  <SelectItem value="ark_skills_report">ARK Skills</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-slate-400">Sort by:</span>
              <Select value={sortBy} onValueChange={(v: 'newest' | 'oldest' | 'type') => setSortBy(v)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-400 ml-auto">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-20 bg-slate-700/50 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery || filterType !== 'all' || filterFormat !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start by generating your first document'}
                  </p>
                  <Link href="/dashboard/student/documents/generate">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Document
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortBy === 'type' ? (
              // Grouped by type
              Object.entries(groupedByType).map(([type, docs]) => (
                <div key={type}>
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className={`${documentTypeColors[type] || 'bg-slate-500'} p-2 rounded-lg text-white`}>
                      {documentTypeIcons[type] || <File className="w-4 h-4" />}
                    </span>
                    {getDocumentTypeLabel(type)} ({docs.length})
                  </h2>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDownload={handleDownload}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Flat list
              filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DocumentCardProps {
  document: Document;
  onDownload: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}

function DocumentCard({ document, onDownload, onPreview }: DocumentCardProps) {
  const getDocumentTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const typeColor = documentTypeColors[document.document_type] || 'bg-slate-500';
  const typeIcon = documentTypeIcons[document.document_type] || <File className="w-5 h-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`${typeColor} p-3 rounded-lg text-white`}>
                {typeIcon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {getDocumentTypeLabel(document.document_type)}
                  </h3>
                  <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">
                    {document.format.toUpperCase()}
                  </Badge>
                  {document.template_used && (
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300">
                      {document.template_used}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(document.generated_at)}</span>
                  </div>
                  {document.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{document.views} views</span>
                    </div>
                  )}
                  {document.downloads !== undefined && (
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{document.downloads} downloads</span>
                    </div>
                  )}
                </div>
                {document.metadata && Object.keys(document.metadata).length > 0 && (
                  <div className="text-xs text-slate-500">
                    {document.metadata.job_id && (
                      <span className="mr-3">Job: {document.metadata.job_id.slice(0, 8)}...</span>
                    )}
                    {document.metadata.project_id && (
                      <span className="mr-3">Project: {document.metadata.project_id.slice(0, 8)}...</span>
                    )}
                    {document.metadata.ark_id && (
                      <span>ARK: {document.metadata.ark_id.slice(0, 8)}...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPreview(document)}
                className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => onDownload(document)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

