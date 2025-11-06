"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  Save, 
  Eye,
  BookOpen,
  Target,
  Link as LinkIcon,
  FileText
} from "lucide-react";
import Link from "next/link";
import { studentCategories } from "@/lib/data/student-categories";

interface Milestone {
  order: number;
  title: string;
  description: string;
  estimatedWeeks: string;
  skillsGained: string[];
  tasks: Task[];
  resources: Resource[];
}

interface Task {
  title: string;
  description: string;
  estimatedHours: string;
  isOptional: boolean;
}

interface Resource {
  type: string;
  title: string;
  provider: string;
  url: string;
  description: string;
  isFree: boolean;
}

interface TemplateData {
  title: string;
  description: string;
  categoryId: string;
  targetGrade: string;
  targetBatch: string;
  milestones: Milestone[];
}

const TOTAL_STEPS = 3;

export default function CreateTemplatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);

  const [templateData, setTemplateData] = useState<TemplateData>({
    title: "",
    description: "",
    categoryId: "",
    targetGrade: "",
    targetBatch: "",
    milestones: []
  });

  const [currentMilestone, setCurrentMilestone] = useState<Milestone>({
    order: 1,
    title: "",
    description: "",
    estimatedWeeks: "",
    skillsGained: [],
    tasks: [],
    resources: []
  });

  const updateTemplateData = (updates: Partial<TemplateData>) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
  };

  const addMilestone = () => {
    if (currentMilestone.title && currentMilestone.description) {
      setTemplateData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...currentMilestone, order: prev.milestones.length + 1 }]
      }));
      setCurrentMilestone({
        order: templateData.milestones.length + 2,
        title: "",
        description: "",
        estimatedWeeks: "",
        skillsGained: [],
        tasks: [],
        resources: []
      });
    }
  };

  const addTask = () => {
    setCurrentMilestone(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        title: "",
        description: "",
        estimatedHours: "",
        isOptional: false
      }]
    }));
  };

  const addResource = () => {
    setCurrentMilestone(prev => ({
      ...prev,
      resources: [...prev.resources, {
        type: "video",
        title: "",
        provider: "",
        url: "",
        description: "",
        isFree: true
      }]
    }));
  };

  const handlePublish = async (isDraft: boolean) => {
    setIsPublishing(true);
    
    try {
      const response = await fetch('/api/ark-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateData,
          is_published: !isDraft
        })
      });

      if (response.ok) {
        router.push('/dashboard/admin?tab=templates');
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: 
        return templateData.title && templateData.description && templateData.categoryId;
      case 2: 
        return templateData.milestones.length > 0;
      case 3: 
        return true;
      default: 
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Template Basic Information</h2>
              <p className="text-xl text-gray-300">
                Create a reusable ARK template for your students.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white text-lg">Template Title</Label>
                <Input
                  value={templateData.title}
                  onChange={(e) => updateTemplateData({ title: e.target.value })}
                  placeholder="e.g., JEE Mathematics Preparation"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white text-lg">Description</Label>
                <Textarea
                  value={templateData.description}
                  onChange={(e) => updateTemplateData({ description: e.target.value })}
                  placeholder="Brief overview of what this template covers..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label className="text-white text-lg">Category</Label>
                <Select
                  value={templateData.categoryId}
                  onValueChange={(value) => updateTemplateData({ categoryId: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {studentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-lg">Target Grade</Label>
                  <Select
                    value={templateData.targetGrade}
                    onValueChange={(value) => updateTemplateData({ targetGrade: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white text-lg">Target Batch (Optional)</Label>
                  <Input
                    value={templateData.targetBatch}
                    onChange={(e) => updateTemplateData({ targetBatch: e.target.value })}
                    placeholder="e.g., 2024"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Add Milestones</h2>
              <p className="text-xl text-gray-300">
                Break down the learning journey into achievable milestones.
              </p>
            </div>

            {/* Added Milestones */}
            {templateData.milestones.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Added Milestones ({templateData.milestones.length})
                </h3>
                {templateData.milestones.map((milestone, idx) => (
                  <Card key={idx} className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-2">
                            Milestone {milestone.order}
                          </Badge>
                          <h4 className="text-white font-semibold">{milestone.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{milestone.description}</p>
                          <div className="mt-2 text-xs text-gray-400">
                            {milestone.tasks.length} tasks • {milestone.resources.length} resources • ~{milestone.estimatedWeeks} weeks
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTemplateData(prev => ({
                              ...prev,
                              milestones: prev.milestones.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Current Milestone Form */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  New Milestone #{templateData.milestones.length + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Milestone Title</Label>
                  <Input
                    value={currentMilestone.title}
                    onChange={(e) => setCurrentMilestone({ ...currentMilestone, title: e.target.value })}
                    placeholder="e.g., Master Algebra Fundamentals"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={currentMilestone.description}
                    onChange={(e) => setCurrentMilestone({ ...currentMilestone, description: e.target.value })}
                    placeholder="What will students achieve in this milestone?"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Estimated Duration (weeks)</Label>
                  <Input
                    value={currentMilestone.estimatedWeeks}
                    onChange={(e) => setCurrentMilestone({ ...currentMilestone, estimatedWeeks: e.target.value })}
                    placeholder="e.g., 4"
                    type="number"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Skills Gained (comma-separated)</Label>
                  <Input
                    value={currentMilestone.skillsGained.join(', ')}
                    onChange={(e) => setCurrentMilestone({ 
                      ...currentMilestone, 
                      skillsGained: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., Problem solving, Equation solving"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white">Tasks ({currentMilestone.tasks.length})</Label>
                    <Button size="sm" onClick={addTask} variant="outline" className="border-slate-600 text-slate-300">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                  
                  {currentMilestone.tasks.map((task, idx) => (
                    <div key={idx} className="bg-slate-700/30 rounded-lg p-3 mb-2">
                      <Input
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...currentMilestone.tasks];
                          newTasks[idx].title = e.target.value;
                          setCurrentMilestone({ ...currentMilestone, tasks: newTasks });
                        }}
                        placeholder="Task title"
                        className="bg-slate-800 border-slate-600 text-white mb-2"
                      />
                      <Input
                        value={task.estimatedHours}
                        onChange={(e) => {
                          const newTasks = [...currentMilestone.tasks];
                          newTasks[idx].estimatedHours = e.target.value;
                          setCurrentMilestone({ ...currentMilestone, tasks: newTasks });
                        }}
                        placeholder="Hours (e.g., 2-3)"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white">Resources ({currentMilestone.resources.length})</Label>
                    <Button size="sm" onClick={addResource} variant="outline" className="border-slate-600 text-slate-300">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Resource
                    </Button>
                  </div>
                  
                  {currentMilestone.resources.map((resource, idx) => (
                    <div key={idx} className="bg-slate-700/30 rounded-lg p-3 mb-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={resource.title}
                          onChange={(e) => {
                            const newResources = [...currentMilestone.resources];
                            newResources[idx].title = e.target.value;
                            setCurrentMilestone({ ...currentMilestone, resources: newResources });
                          }}
                          placeholder="Resource title"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                        <Input
                          value={resource.url}
                          onChange={(e) => {
                            const newResources = [...currentMilestone.resources];
                            newResources[idx].url = e.target.value;
                            setCurrentMilestone({ ...currentMilestone, resources: newResources });
                          }}
                          placeholder="URL"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={addMilestone}
                  disabled={!currentMilestone.title || !currentMilestone.description}
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const selectedCategory = studentCategories.find(c => c.id === templateData.categoryId);
        
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Review & Publish</h2>
              <p className="text-xl text-gray-300">
                Review your template before publishing it to students.
              </p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-3xl mb-3">{selectedCategory?.emoji}</div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {templateData.title}
                    </CardTitle>
                    <p className="text-gray-300">{templateData.description}</p>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    Grade {templateData.targetGrade}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{templateData.milestones.length}</p>
                      <p className="text-sm text-gray-400">Milestones</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">
                        {templateData.milestones.reduce((sum, m) => sum + m.tasks.length, 0)}
                      </p>
                      <p className="text-sm text-gray-400">Total Tasks</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">
                        {templateData.milestones.reduce((sum, m) => sum + m.resources.length, 0)}
                      </p>
                      <p className="text-sm text-gray-400">Resources</p>
                    </div>
                  </div>

                  {/* Milestone Preview */}
                  <div className="space-y-3 pt-4">
                    <h4 className="font-semibold text-white">Milestones Overview:</h4>
                    {templateData.milestones.map((milestone, idx) => (
                      <div key={idx} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="text-white font-semibold">{milestone.title}</h5>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            ~{milestone.estimatedWeeks} weeks
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{milestone.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {milestone.skillsGained.map((skill, i) => (
                            <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Publish Buttons */}
                  <div className="flex space-x-3 pt-6">
                    <Button
                      onClick={() => handlePublish(false)}
                      disabled={isPublishing}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Publish Template
                    </Button>
                    <Button
                      onClick={() => handlePublish(true)}
                      disabled={isPublishing}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-black via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/admin" className="flex items-center gap-3">
              <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold text-white">Create ARK Template</span>
            </Link>
            <div className="text-gray-300">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700 max-w-4xl mx-auto">
            <Button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={() => setCurrentStep(prev => Math.min(TOTAL_STEPS, prev + 1))}
              disabled={!canProceed()}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

