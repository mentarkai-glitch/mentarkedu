#!/usr/bin/env tsx

/**
 * Demo Data Generator for Mentark Quantum
 * 
 * Generates realistic demo data for:
 * - 2 Institutes (Aakash - Quantum, Allen - Neuro)
 * - Users (admins, teachers, students)
 * - Student profiles, ARKs, check-ins, chat history
 * - Gamification data, career DNA, risk predictions
 * - Teacher assignments and interventions
 * - Admin billing and templates
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Demo data configuration
const config = {
  institutes: [
    { name: 'Aakash Institute', plan: 'quantum' },
    { name: 'Allen Career Institute', plan: 'neuro' }
  ],
  teachersPerInstitute: 3,
  studentsPerInstitute: 15,
  daysOfHistory: 30,
  arksPerStudent: 2,
  checkInsPerStudent: 20,
  chatMessagesPerStudent: 8,
  interventionsPerTeacher: 5
};

// Sample data arrays
const teacherSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
const studentNames = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Singh', 'Vikram Gupta',
  'Ananya Reddy', 'Karthik Nair', 'Deepika Joshi', 'Rohan Agarwal', 'Meera Iyer',
  'Aditya Das', 'Kavya Menon', 'Siddharth Rao', 'Pooja Shah', 'Nikhil Verma',
  'Shreya Bhatt', 'Aryan Malhotra', 'Divya Chopra', 'Rishabh Jain', 'Isha Agarwal',
  'Kunal Mehta', 'Ritika Saxena', 'Varun Khanna', 'Anjali Bansal', 'Rajesh Tiwari',
  'Sakshi Goyal', 'Manish Dubey', 'Neha Sharma', 'Abhishek Singh', 'Pallavi Rao'
];

const grades = ['9', '10', '11', '12'];
const batches = ['2024', '2025', '2026'];
const categories = ['academic_excellence', 'career_preparation', 'personal_development', 'emotional_wellbeing', 'social_relationships', 'life_skills'];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

function generateOnboardingProfile(grade: string) {
  const profiles = {
    '9': {
      interests: ['Sports', 'Music', 'Art', 'Reading', 'Gaming'],
      goals: ['Improve grades', 'Make new friends', 'Join clubs', 'Learn new skills'],
      personality: ['Creative', 'Social', 'Curious', 'Energetic'],
      learning_style: ['Visual', 'Kinesthetic', 'Auditory']
    },
    '10': {
      interests: ['Science', 'Mathematics', 'Technology', 'Sports', 'Literature'],
      goals: ['Board exam preparation', 'Career exploration', 'Skill development', 'Leadership'],
      personality: ['Analytical', 'Focused', 'Ambitious', 'Organized'],
      learning_style: ['Visual', 'Logical', 'Reading/Writing']
    },
    '11': {
      interests: ['Engineering', 'Medicine', 'Commerce', 'Arts', 'Research'],
      goals: ['JEE/NEET preparation', 'Career clarity', 'Academic excellence', 'Competitive exams'],
      personality: ['Determined', 'Goal-oriented', 'Persistent', 'Self-motivated'],
      learning_style: ['Logical', 'Reading/Writing', 'Visual']
    },
    '12': {
      interests: ['Higher studies', 'Career planning', 'Skill specialization', 'Research'],
      goals: ['University admission', 'Career launch', 'Skill mastery', 'Personal growth'],
      personality: ['Mature', 'Independent', 'Strategic', 'Reflective'],
      learning_style: ['Reading/Writing', 'Logical', 'Visual']
    }
  };

  const profile = profiles[grade as keyof typeof profiles] || profiles['10'];
  
  return {
    grade,
    interests: getRandomElements(profile.interests, 3),
    goals: getRandomElements(profile.goals, 2),
    personality_traits: getRandomElements(profile.personality, 2),
    learning_style: getRandomElement(profile.learning_style),
    weekly_hours: Math.floor(Math.random() * 15) + 10,
    motivation_level: Math.floor(Math.random() * 4) + 6,
    stress_level: Math.floor(Math.random() * 4) + 3,
    confidence_level: Math.floor(Math.random() * 4) + 5
  };
}

async function generateInstitutes() {
  console.log('🏢 Generating institutes...');
  
  const institutes = [];
  for (const institute of config.institutes) {
    const { data, error } = await supabase
      .from('institutes')
      .insert({
        name: institute.name,
        plan_type: institute.plan,
        logo_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${institute.name}`,
        settings: {
          features: institute.plan === 'quantum' 
            ? ['emotion_analysis', 'career_dna', 'peer_matching', 'advanced_analytics']
            : ['basic_mentorship', 'ark_generation', 'progress_tracking']
        }
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating institute ${institute.name}:`, error);
      continue;
    }

    institutes.push(data);
    console.log(`✅ Created institute: ${institute.name} (${institute.plan})`);
  }

  return institutes;
}

async function generateUsers(institutes: any[]) {
  console.log('👥 Generating users...');
  
  const allUsers = [];
  
  for (const institute of institutes) {
    // Generate admin
    const adminEmail = `admin@${institute.name.toLowerCase().replace(/\s+/g, '')}.com`;
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        institute_id: institute.id,
        role: 'admin'
      }
    });

    if (!adminError && adminData.user) {
      await supabase.from('users').insert({
        id: adminData.user.id,
        institute_id: institute.id,
        role: 'admin',
        email: adminEmail,
        profile_data: {
          first_name: 'Admin',
          last_name: institute.name.split(' ')[0]
        }
      });

      await supabase.from('admins').insert({
        user_id: adminData.user.id
      });

      allUsers.push({ ...adminData.user, role: 'admin', institute_id: institute.id });
      console.log(`✅ Created admin for ${institute.name}`);
    }

    // Generate teachers
    for (let i = 0; i < config.teachersPerInstitute; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `teacher${i + 1}@${institute.name.toLowerCase().replace(/\s+/g, '')}.com`;
      
      const { data: teacherData, error: teacherError } = await supabase.auth.admin.createUser({
        email,
        password: 'teacher123',
        email_confirm: true,
        user_metadata: {
          institute_id: institute.id,
          role: 'teacher'
        }
      });

      if (!teacherError && teacherData.user) {
        await supabase.from('users').insert({
          id: teacherData.user.id,
          institute_id: institute.id,
          role: 'teacher',
          email,
          profile_data: {
            first_name: firstName,
            last_name: lastName
          }
        });

        await supabase.from('teachers').insert({
          user_id: teacherData.user.id,
          specialization: getRandomElements(teacherSubjects, 2),
          assigned_batches: getRandomElements(batches, 2)
        });

        allUsers.push({ ...teacherData.user, role: 'teacher', institute_id: institute.id });
        console.log(`✅ Created teacher: ${firstName} ${lastName}`);
      }
    }

    // Generate students
    for (let i = 0; i < config.studentsPerInstitute; i++) {
      const fullName = studentNames[i % studentNames.length];
      const [firstName, lastName] = fullName.split(' ');
      const email = `student${i + 1}@${institute.name.toLowerCase().replace(/\s+/g, '')}.com`;
      
      const { data: studentData, error: studentError } = await supabase.auth.admin.createUser({
        email,
        password: 'student123',
        email_confirm: true,
        user_metadata: {
          institute_id: institute.id,
          role: 'student'
        }
      });

      if (!studentError && studentData.user) {
        const grade = getRandomElement(grades);
        const onboardingProfile = generateOnboardingProfile(grade);

        await supabase.from('users').insert({
          id: studentData.user.id,
          institute_id: institute.id,
          role: 'student',
          email,
          profile_data: {
            first_name: firstName,
            last_name: lastName
          }
        });

        await supabase.from('students').insert({
          user_id: studentData.user.id,
          grade,
          batch: getRandomElement(batches),
          interests: onboardingProfile.interests,
          goals: onboardingProfile.goals,
          risk_score: Math.floor(Math.random() * 40) + 20,
          onboarding_profile: onboardingProfile
        });

        allUsers.push({ ...studentData.user, role: 'student', institute_id: institute.id, grade, batch: getRandomElement(batches) });
        console.log(`✅ Created student: ${firstName} ${lastName} (Grade ${grade})`);
      }
    }
  }

  return allUsers;
}

async function generateARKs(users: any[]) {
  console.log('🎯 Generating ARKs...');
  
  const students = users.filter(u => u.role === 'student');
  let arkCount = 0;

  for (const student of students) {
    const numArks = Math.floor(Math.random() * 2) + 1; // 1-2 ARKs per student

    for (let i = 0; i < numArks; i++) {
      const category = getRandomElement(categories);
      const duration = Math.floor(Math.random() * 12) + 4; // 4-16 weeks
      const progress = Math.floor(Math.random() * 80) + 10; // 10-90%

      const { data, error } = await supabase
        .from('arks')
        .insert({
          student_id: student.id,
          category,
          title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Journey`,
          description: `Personalized roadmap for ${category.replace('_', ' ')} development`,
          duration_weeks: duration,
          status: progress > 80 ? 'completed' : 'active',
          progress_percentage: progress,
          created_at: getRandomDate(config.daysOfHistory)
        })
        .select()
        .single();

      if (!error && data) {
        // Generate milestones
        const numMilestones = Math.floor(Math.random() * 4) + 3; // 3-6 milestones
        for (let j = 0; j < numMilestones; j++) {
          const completed = j < Math.floor((progress / 100) * numMilestones);
          
          await supabase.from('ark_milestones').insert({
            ark_id: data.id,
            title: `Milestone ${j + 1}: ${faker.lorem.words(3)}`,
            description: faker.lorem.sentence(),
            order: j + 1,
            completed,
            due_date: new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        arkCount++;
        console.log(`✅ Created ARK for ${student.profile_data?.first_name} (${progress}% complete)`);
      }
    }
  }

  console.log(`📊 Generated ${arkCount} ARKs total`);
}

async function generateDailyCheckins(users: any[]) {
  console.log('📅 Generating daily check-ins...');
  
  const students = users.filter(u => u.role === 'student');
  let checkinCount = 0;

  for (const student of students) {
    const numCheckins = Math.floor(Math.random() * 10) + config.checkInsPerStudent;

    for (let i = 0; i < numCheckins; i++) {
      const energy = Math.floor(Math.random() * 5) + 1;
      const focus = Math.floor(Math.random() * 5) + 1;
      const emotion = Math.floor(Math.random() * 5) + 1;
      const notes = Math.random() > 0.7 ? faker.lorem.sentence() : null;

      await supabase.from('daily_checkins').insert({
        student_id: student.id,
        energy_level: energy,
        focus_quality: focus,
        emotional_state: emotion,
        notes,
        date: getRandomDate(config.daysOfHistory)
      });

      checkinCount++;
    }
  }

  console.log(`📊 Generated ${checkinCount} daily check-ins`);
}

async function generateChatHistory(users: any[]) {
  console.log('💬 Generating chat history...');
  
  const students = users.filter(u => u.role === 'student');
  let messageCount = 0;

  for (const student of students) {
    // Create chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: student.id,
        mentor_persona: getRandomElement(['friendly', 'strict', 'calm', 'logical', 'spiritual']),
        context_summary: faker.lorem.sentence()
      })
      .select()
      .single();

    if (!sessionError && session) {
      const numMessages = Math.floor(Math.random() * 5) + config.chatMessagesPerStudent;

      for (let i = 0; i < numMessages; i++) {
        const isUser = i % 2 === 0;
        const content = isUser 
          ? faker.lorem.sentence()
          : faker.lorem.paragraph();

        await supabase.from('messages').insert({
          session_id: session.id,
          role: isUser ? 'user' : 'assistant',
          content,
          emotion_score: Math.random() * 2 - 1, // -1 to 1
          timestamp: getRandomDate(config.daysOfHistory)
        });

        messageCount++;
      }
    }
  }

  console.log(`📊 Generated ${messageCount} chat messages`);
}

async function generateGamificationData(users: any[]) {
  console.log('🏆 Generating gamification data...');
  
  const students = users.filter(u => u.role === 'student');

  for (const student of students) {
    const xp = Math.floor(Math.random() * 2000) + 500;
    const level = Math.floor(Math.sqrt(xp / 100));
    const streakDays = Math.floor(Math.random() * 30) + 1;
    const coins = Math.floor(Math.random() * 500) + 100;

    await supabase.from('student_stats').insert({
      user_id: student.id,
      xp,
      level,
      streak_days: streakDays,
      coins
    });

    // Award some badges
    const badgeCount = Math.floor(Math.random() * 4) + 1;
    const badgeIds = getRandomElements([1, 2, 3, 4, 5, 6, 7, 8], badgeCount);
    
    for (const badgeId of badgeIds) {
      await supabase.from('user_achievements').insert({
        user_id: student.id,
        achievement_id: badgeId,
        earned_at: getRandomDate(config.daysOfHistory)
      });
    }
  }

  console.log(`📊 Generated gamification data for ${students.length} students`);
}

async function generateCareerDNA(users: any[]) {
  console.log('🧬 Generating career DNA profiles...');
  
  const students = users.filter(u => u.role === 'student');

  for (const student of students) {
    const clusters = {
      'Technology': Math.random() * 0.8 + 0.2,
      'Healthcare': Math.random() * 0.8 + 0.2,
      'Business': Math.random() * 0.8 + 0.2,
      'Creative': Math.random() * 0.8 + 0.2,
      'Science': Math.random() * 0.8 + 0.2,
      'Education': Math.random() * 0.8 + 0.2,
      'Engineering': Math.random() * 0.8 + 0.2,
      'Arts': Math.random() * 0.8 + 0.2,
      'Finance': Math.random() * 0.8 + 0.2,
      'Social': Math.random() * 0.8 + 0.2
    };

    await supabase.from('student_career_dna').insert({
      student_id: student.id,
      clusters: clusters,
      strengths: getRandomElements(['Analytical', 'Creative', 'Leadership', 'Communication', 'Problem-solving'], 3),
      recommendations: [faker.lorem.sentence(), faker.lorem.sentence()],
      updated_at: new Date().toISOString()
    });
  }

  console.log(`📊 Generated career DNA for ${students.length} students`);
}

async function generateRiskPredictions(users: any[]) {
  console.log('⚠️ Generating risk predictions...');
  
  const students = users.filter(u => u.role === 'student');

  for (const student of students) {
    const dropoutRisk = Math.floor(Math.random() * 40) + 20;
    const burnoutRisk = Math.floor(Math.random() * 40) + 15;
    const disengagementRisk = Math.floor(Math.random() * 40) + 10;

    await supabase.from('risk_predictions').insert({
      student_id: student.id,
      dropout_risk: dropoutRisk,
      burnout_risk: burnoutRisk,
      disengagement_risk: disengagementRisk,
      risk_level: dropoutRisk > 70 ? 'critical' : dropoutRisk > 50 ? 'high' : 'medium',
      risk_factors: getRandomElements(['Low engagement', 'Missed check-ins', 'Declining grades', 'Social isolation'], 2),
      protective_factors: getRandomElements(['Strong support network', 'Good attendance', 'Active participation', 'Positive attitude'], 2),
      recommended_interventions: [faker.lorem.sentence(), faker.lorem.sentence()],
      confidence_score: Math.random() * 0.3 + 0.7,
      created_at: getRandomDate(7)
    });
  }

  console.log(`📊 Generated risk predictions for ${students.length} students`);
}

async function generateTeacherAssignments(users: any[]) {
  console.log('👨‍🏫 Generating teacher assignments...');
  
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  for (const teacher of teachers) {
    const assignedStudents = getRandomElements(students, Math.floor(Math.random() * 10) + 5);
    
    for (const student of assignedStudents) {
      await supabase.from('teacher_student_assignments').insert({
        teacher_id: teacher.id,
        student_id: student.id,
        batch: student.batch || getRandomElement(batches),
        subject: getRandomElement(teacherSubjects),
        assigned_at: getRandomDate(config.daysOfHistory)
      });
    }

    // Generate interventions
    const numInterventions = Math.floor(Math.random() * 3) + config.interventionsPerTeacher;
    const teacherStudents = assignedStudents.slice(0, Math.floor(assignedStudents.length / 2));
    
    for (let i = 0; i < numInterventions; i++) {
      const student = getRandomElement(teacherStudents);
      const types = ['note', 'meeting', 'task', 'alert', 'praise'];
      const priorities = ['low', 'medium', 'high', 'critical'];

      await supabase.from('interventions').insert({
        teacher_id: teacher.id,
        student_id: student.id,
        type: getRandomElement(types),
        title: faker.lorem.words(4),
        content: faker.lorem.paragraph(),
        priority: getRandomElement(priorities),
        status: getRandomElement(['new', 'acknowledged', 'addressed', 'resolved']),
        due_date: getRandomDate(30),
        created_at: getRandomDate(config.daysOfHistory)
      });
    }
  }

  console.log(`📊 Generated teacher assignments and interventions`);
}

async function generateBillingData(institutes: any[]) {
  console.log('💰 Generating billing data...');
  
  for (const institute of institutes) {
    const studentCount = config.studentsPerInstitute;
    const monthlyPrice = institute.plan_type === 'quantum' ? 999 : 749;
    const totalAmount = studentCount * monthlyPrice;

    await supabase.from('institute_billing').insert({
      institute_id: institute.id,
      plan_type: institute.plan_type,
      student_count: studentCount,
      monthly_amount: monthlyPrice,
      total_amount: totalAmount,
      billing_cycle: 'monthly',
      status: 'active',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Generate payment history
    for (let i = 0; i < 6; i++) {
      await supabase.from('payment_history').insert({
        institute_id: institute.id,
        amount: totalAmount,
        currency: 'INR',
        status: 'completed',
        payment_method: 'bank_transfer',
        transaction_id: faker.string.alphanumeric(12).toUpperCase(),
        paid_at: getRandomDate(180)
      });
    }
  }

  console.log(`📊 Generated billing data for ${institutes.length} institutes`);
}

async function generateARKTemplates(institutes: any[]) {
  console.log('📋 Generating ARK templates...');
  
  for (const institute of institutes) {
    const numTemplates = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numTemplates; i++) {
      const category = getRandomElement(categories);
      const grade = getRandomElement(grades);

      await supabase.from('ark_templates').insert({
        institute_id: institute.id,
        created_by: null, // Could be admin user_id
        category_id: category,
        title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - Grade ${grade}`,
        description: faker.lorem.paragraph(),
        target_grade: grade,
        target_batch: getRandomElement(batches),
        is_published: true,
        template_data: {
          milestones: [
            {
              title: 'Foundation Phase',
              description: 'Build fundamental knowledge',
              estimatedWeeks: 4,
              tasks: [faker.lorem.sentence(), faker.lorem.sentence()]
            },
            {
              title: 'Development Phase', 
              description: 'Apply and practice skills',
              estimatedWeeks: 6,
              tasks: [faker.lorem.sentence(), faker.lorem.sentence()]
            },
            {
              title: 'Mastery Phase',
              description: 'Achieve proficiency and expertise',
              estimatedWeeks: 4,
              tasks: [faker.lorem.sentence(), faker.lorem.sentence()]
            }
          ]
        },
        created_at: getRandomDate(config.daysOfHistory)
      });
    }
  }

  console.log(`📊 Generated ARK templates for ${institutes.length} institutes`);
}

async function main() {
  console.log('🚀 Starting Mentark Quantum Demo Data Generation...\n');

  try {
    // Generate all demo data
    const institutes = await generateInstitutes();
    const users = await generateUsers(institutes);
    
    await generateARKs(users);
    await generateDailyCheckins(users);
    await generateChatHistory(users);
    await generateGamificationData(users);
    await generateCareerDNA(users);
    await generateRiskPredictions(users);
    await generateTeacherAssignments(users);
    await generateBillingData(institutes);
    await generateARKTemplates(institutes);

    console.log('\n✅ Demo data generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Institutes: ${institutes.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Students: ${users.filter(u => u.role === 'student').length}`);
    console.log(`- Teachers: ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`- Admins: ${users.filter(u => u.role === 'admin').length}`);

    console.log('\n🔑 Demo Login Credentials:');
    institutes.forEach(institute => {
      console.log(`\n${institute.name}:`);
      console.log(`  Admin: admin@${institute.name.toLowerCase().replace(/\s+/g, '')}.com / admin123`);
      console.log(`  Teacher: teacher1@${institute.name.toLowerCase().replace(/\s+/g, '')}.com / teacher123`);
      console.log(`  Student: student1@${institute.name.toLowerCase().replace(/\s+/g, '')}.com / student123`);
    });

  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main };

