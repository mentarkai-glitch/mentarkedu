"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, FileText, Mail, Calendar, UserPlus } from "lucide-react";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  specialization: string[];
  assigned_batches: string[];
  student_count: number;
  interventions: {
    total: number;
    pending: number;
    completed: number;
  };
  created_at: string;
}

interface TeacherListProps {
  teachers: Teacher[];
  onAddTeacher: () => void;
  onAssignBatch: (teacherId: string) => void;
}

export function TeacherList({ teachers, onAddTeacher, onAssignBatch }: TeacherListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          Teachers ({teachers.length})
        </h3>
        <Button
          onClick={onAddTeacher}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {teachers.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No teachers yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Add your first teacher to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.full_name}
                        className="w-14 h-14 rounded-full border-2 border-slate-600"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <User className="h-7 w-7 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {teacher.full_name}
                      </h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">{teacher.email}</span>
                      </div>
                      
                      {teacher.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teacher.specialization.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="border-cyan-500/30 text-cyan-400">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span className="text-xs text-gray-400">Students</span>
                          </div>
                          <p className="text-xl font-bold text-white">{teacher.student_count}</p>
                        </div>
                        
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-gray-400">Interventions</span>
                          </div>
                          <p className="text-xl font-bold text-white">{teacher.interventions.total}</p>
                        </div>
                        
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-gray-400">Batches</span>
                          </div>
                          <p className="text-xl font-bold text-white">{teacher.assigned_batches.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignBatch(teacher.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Assign Batch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

