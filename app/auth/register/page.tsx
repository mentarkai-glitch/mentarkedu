"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    instituteName: "",
    email: "",
    password: "",
    role: "",
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            institute_name: formData.instituteName,
          }
        }
      });

      if (authError) {
        toast.error("Registration failed: " + authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create user account");
        setLoading(false);
        return;
      }

      // 2. Create institute record (if admin)
      let instituteId = null;
      if (formData.role === "admin") {
        const { data: instituteData, error: instituteError } = await supabase
          .from('institutes')
          .insert({
            name: formData.instituteName,
            admin_id: authData.user.id,
            status: 'active'
          })
          .select()
          .single();

        if (instituteError) {
          console.error('Institute creation error:', instituteError);
          toast.error("Failed to create institute record");
        } else {
          instituteId = instituteData.id;
        }
      }

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          institute_id: instituteId,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error("Failed to create user profile");
      }

      // 4. Create role-specific record
      if (formData.role === "student") {
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            user_id: authData.user.id,
            onboarding_completed: false,
            current_level: 1,
            total_xp: 0,
            created_at: new Date().toISOString()
          });

        if (studentError) {
          console.error('Student record creation error:', studentError);
        }
      } else if (formData.role === "teacher") {
        const { error: teacherError } = await supabase
          .from('teachers')
          .insert({
            user_id: authData.user.id,
            institute_id: instituteId,
            is_active: true,
            created_at: new Date().toISOString()
          });

        if (teacherError) {
          console.error('Teacher record creation error:', teacherError);
        }
      }

      toast.success("Account created successfully! Please check your email to verify your account.");
      router.push("/auth/login");

    } catch (error) {
      console.error('Registration error:', error);
      toast.error("An unexpected error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card p-8">
        <div className="mb-8 text-center">
          <img 
            src="/logo.png" 
            alt="Mentark Quantum" 
            className="mx-auto mb-4 h-16 w-16 rounded-xl" 
          />
          <h1 className="font-display text-2xl font-bold">Create Your Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your AI-powered mentorship journey
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="instituteName">Institute Name</Label>
            <Input
              id="instituteName"
              type="text"
              placeholder="Aakash Institute"
              value={formData.instituteName}
              onChange={(e) =>
                setFormData({ ...formData, instituteName: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Ravi"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Kumar"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Your Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Institute Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@institute.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters with numbers and symbols
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}

