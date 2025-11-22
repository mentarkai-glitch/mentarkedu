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
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabNav } from '@/components/ui/tab-nav';
import { toast } from 'sonner';
import { generateResume, getCurrentResume, downloadDocumentAsFile } from '@/lib/services/document-generation';
import { createClient } from '@/lib/supabase/client';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

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
  const [activeTab, setActiveTab] = useState('personal');

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
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Resume Builder"
          description="Create a professional resume from your profile and ARK progress"
          icon={<FileText className="w-8 h-8 text-gold" />}
          actions={
            currentResume && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-gold/40 text-gold hover:bg-gold/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Spinner size="sm" color="gold" />
                      <span className="ml-2">Generating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            )
          }
        />

        <PageContainer spacing="md">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Form */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabNav
                items={[
                  { value: 'personal', label: 'Personal' },
                  { value: 'experience', label: 'Experience' },
                  { value: 'education', label: 'Education' },
                  { value: 'skills', label: 'Skills' },
                  { value: 'projects', label: 'Projects' }
                ]}
                value={activeTab}
                onValueChange={setActiveTab}
                fullWidth
                variant="default"
                size="md"
              />

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-4">
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Full Name *</Label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Professional Title</Label>
                        <Input
                          value={profile.title}
                          onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Email *</Label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone *</Label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Location</Label>
                        <Input
                          value={profile.location}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">LinkedIn</Label>
                        <Input
                          value={profile.linkedin}
                          onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                          className="bg-card/50 border-border text-foreground"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Professional Summary</Label>
                      <Textarea
                        value={profile.summary}
                        onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                        className="bg-card/50 border-border text-foreground"
                        placeholder="Brief summary of your professional background..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience */}
              <TabsContent value="experience" className="space-y-4">
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground flex items-center gap-2">
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
                      <div key={idx} className="p-4 bg-card/30 rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-muted-foreground">Job Title</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].title = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].company = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-muted-foreground">Start Date</Label>
                            <Input
                              type="date"
                              value={exp.start_date}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].start_date = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">End Date</Label>
                            <Input
                              type="date"
                              value={exp.end_date}
                              onChange={(e) => {
                                const newExp = [...profile.experience];
                                newExp[idx].end_date = e.target.value;
                                setProfile(prev => ({ ...prev, experience: newExp }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [...profile.experience];
                              newExp[idx].description = e.target.value;
                              setProfile(prev => ({ ...prev, experience: newExp }));
                            }}
                            className="bg-card/50 border-border text-foreground"
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    {profile.experience.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No experience added yet. Click "Add Experience" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education */}
              <TabsContent value="education" className="space-y-4">
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground flex items-center gap-2">
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
                      <div key={idx} className="p-4 bg-card/30 rounded-lg border border-border">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-muted-foreground">Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].degree = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].institution = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Graduation Date</Label>
                            <Input
                              type="date"
                              value={edu.graduation_date}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].graduation_date = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">GPA (Optional)</Label>
                            <Input
                              value={edu.gpa || ''}
                              onChange={(e) => {
                                const newEdu = [...profile.education];
                                newEdu[idx].gpa = e.target.value;
                                setProfile(prev => ({ ...prev, education: newEdu }));
                              }}
                              className="bg-card/50 border-border text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {profile.education.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No education added yet. Click "Add Education" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills" className="space-y-4">
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Skills & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Skills (comma-separated)</Label>
                      <Input
                        value={profile.skills.join(', ')}
                        onChange={(e) => {
                          const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                          setProfile(prev => ({ ...prev, skills }));
                        }}
                        className="bg-card/50 border-border text-foreground"
                        placeholder="Python, JavaScript, React, Node.js"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Certifications (one per line)</Label>
                      <Textarea
                        value={profile.certifications.join('\n')}
                        onChange={(e) => {
                          const certs = e.target.value.split('\n').filter(c => c.trim());
                          setProfile(prev => ({ ...prev, certifications: certs }));
                        }}
                        className="bg-card/50 border-border text-foreground"
                        rows={4}
                        placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Languages (comma-separated)</Label>
                      <Input
                        value={profile.languages.join(', ')}
                        onChange={(e) => {
                          const langs = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                          setProfile(prev => ({ ...prev, languages: langs }));
                        }}
                        className="bg-card/50 border-border text-foreground"
                        placeholder="English, Spanish, Hindi"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects */}
              <TabsContent value="projects" className="space-y-4">
                <Card className="bg-card/50 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground flex items-center gap-2">
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
                      <div key={idx} className="p-4 bg-card/30 rounded-lg border border-border">
                        <div className="mb-4">
                          <Label className="text-muted-foreground">Project Name</Label>
                          <Input
                            value={proj.name}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].name = e.target.value;
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-card/50 border-border text-foreground"
                          />
                        </div>
                        <div className="mb-4">
                          <Label className="text-muted-foreground">Description</Label>
                          <Textarea
                            value={proj.description}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].description = e.target.value;
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-card/50 border-border text-foreground"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Technologies (comma-separated)</Label>
                          <Input
                            value={proj.technologies.join(', ')}
                            onChange={(e) => {
                              const newProj = [...profile.projects];
                              newProj[idx].technologies = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                              setProfile(prev => ({ ...prev, projects: newProj }));
                            }}
                            className="bg-card/50 border-border text-foreground"
                          />
                        </div>
                      </div>
                    ))}
                    {profile.projects.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No projects added yet. Click "Add Project" to get started.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview & Settings */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Generate Resume</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose template and format, then generate your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground mb-2 block">Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-card/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground mb-2 block">Format</Label>
                  <Select value={selectedFormat} onValueChange={(v: 'pdf' | 'docx') => setSelectedFormat(v)}>
                    <SelectTrigger className="bg-card/50 border-border text-foreground">
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
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Last Generated:</p>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resume ready for download</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Keep your summary concise (2-3 sentences)</p>
                <p>• Use action verbs in experience descriptions</p>
                <p>• Quantify achievements when possible</p>
                <p>• Tailor skills to match job requirements</p>
                <p>• Keep resume to 1-2 pages for most roles</p>
              </CardContent>
            </Card>
          </div>
        </div>
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}



