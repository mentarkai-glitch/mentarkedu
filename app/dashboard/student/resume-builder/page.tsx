'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Save, 
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { generateResume, getCurrentResume, downloadDocumentAsFile } from '@/lib/services/document-generation';
import { createClient } from '@/lib/supabase/client';

interface ResumeProfile {
  name: string;
  title?: string;
  location: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduation_date: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: string[];
  languages: string[];
  kpis?: string[];
}

export default function ResumeBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentResume, setCurrentResume] = useState<any>(null);
  const [profile, setProfile] = useState<ResumeProfile>({
    name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx'>('pdf');

  useEffect(() => {
    loadStudentProfile();
    loadCurrentResume();
  }, []);

  const loadStudentProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('onboarding_profile')
        .eq('user_id', user.id)
        .single();

      if (student?.onboarding_profile) {
        const p = student.onboarding_profile;
        setProfile(prev => ({
          ...prev,
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || p.city || '',
          title: p.career_interest || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadCurrentResume = async () => {
    try {
      const resume = await getCurrentResume();
      setCurrentResume(resume);
    } catch (error) {
      console.error('Failed to load resume:', error);
    }
  };

  const handleGenerate = async () => {
    if (!profile.name || !profile.email) {
      toast.error('Please fill in at least name and email');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateResume({
        template: selectedTemplate,
        format: selectedFormat,
        profile,
      });

      toast.success('Resume generated successfully!');
      setCurrentResume({ id: result.id, download_url: result.download_url });
      await loadCurrentResume();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate resume');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!currentResume?.id) {
      toast.error('No resume to download');
      return;
    }

    try {
      await downloadDocumentAsFile(currentResume.id, `resume-${selectedTemplate}.${selectedFormat}`);
      toast.success('Resume downloaded!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download resume');
    }
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: '',
        bullets: [],
      }],
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        graduation_date: '',
      }],
    }));
  };

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: [],
      }],
    }));
  };

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
                Resume Builder
              </h1>
              <p className="text-slate-400">Create a professional resume from your profile and ARK progress</p>
            </div>
            {currentResume && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Form */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Full Name *</Label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Professional Title</Label>
                        <Input
                          value={profile.title}
                          onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Email *</Label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Phone *</Label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Location</Label>
                        <Input
                          value={profile.location}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">LinkedIn</Label>
                        <Input
                          value={profile.linkedin}
                          onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Professional Summary</Label>
                      <Textarea
                        value={profile.summary}
                        onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Brief summary of your professional background..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience */}
              <TabsContent value="experience" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Work Experience
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={addExperience}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-slate-300">Job Title</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].title = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].company = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-slate-300">Start Date</Label>
                            <Input
                              type="date"
                              value={exp.start_date}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].start_date = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">End Date</Label>
                            <Input
                              type="date"
                              value={exp.end_date}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].end_date = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-300">Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...profile.experience];
                              newExp[idx].description = e.target.value;
                              setProfile(prev => ({ ...prev, experience: newExp }));
                            }}
                            className="bg-slate-700/50 border-slate-600 text-white"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    {profile.experience.length === 0 && (
                      <p className="text-slate-400 text-center py-8">No experience added yet. Click "Add Experience" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education */}
              <TabsContent value="education" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={addEducation}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-slate-300">Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].degree = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].institution = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-slate-300">Graduation Date</Label>
                            <Input
                              type="date"
                              value={edu.graduation_date}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].graduation_date = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">GPA (Optional)</Label>
                            <Input
                              value={edu.gpa || ''}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].gpa = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {profile.education.length === 0 && (
                      <p className="text-slate-400 text-center py-8">No education added yet. Click "Add Education" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Skills & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Skills (comma-separated)</Label>
                      <Input
                        value={profile.skills.join(', ')}
                        onChange={(e) => {
                          const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                          setProfile(prev => ({ ...prev, skills }));
                        }}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Python, JavaScript, React, Node.js"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Certifications (one per line)</Label>
                      <Textarea
                        value={profile.certifications.join('\n')}
                        onChange={(e) => {
                          const certs = e.target.value.split('\n').filter(c => c.trim());
                          setProfile(prev => ({ ...prev, certifications: certs }));
                        }}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        rows={4}
                        placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Languages (comma-separated)</Label>
                      <Input
                        value={profile.languages.join(', ')}
                        onChange={(e) => {
                          const langs = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                          setProfile(prev => ({ ...prev, languages: langs }));
                        }}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="English, Spanish, Hindi"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects */}
              <TabsContent value="projects" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Projects
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={addProject}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div className="mb-4">
                          <Label className="text-slate-300">Project Name</Label>
                          <Input
                            value={proj.name}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].name = e.target.value;
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                        <div className="mb-4">
                          <Label className="text-slate-300">Description</Label>
                          <Textarea
                            value={proj.description}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].description = e.target.value;
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-slate-700/50 border-slate-600 text-white"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Technologies (comma-separated)</Label>
                          <Input
                            value={proj.technologies.join(', ')}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].technologies = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    ))}
                    {profile.projects.length === 0 && (
                      <p className="text-slate-400 text-center py-8">No projects added yet. Click "Add Project" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview & Settings */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generate Resume</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose template and format, then generate your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Format</Label>
                  <Select value={selectedFormat} onValueChange={(v: 'pdf' | 'docx') => setSelectedFormat(v)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !profile.name || !profile.email}
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
                      Generate Resume
                    </>
                  )}
                </Button>
                {currentResume && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Last Generated:</p>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resume ready for download</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-400">
                <p>• Keep your summary concise (2-3 sentences)</p>
                <p>• Use action verbs in experience descriptions</p>
                <p>• Quantify achievements when possible</p>
                <p>• Tailor skills to match job requirements</p>
                <p>• Keep resume to 1-2 pages for most roles</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

