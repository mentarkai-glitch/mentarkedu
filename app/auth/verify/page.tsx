"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: searchParams.get('token_hash') || '',
          type: 'email',
        });

        if (error) {
          setStatus('error');
          setMessage(error.message || "Verification failed");
          toast.error("Verification failed");
        } else if (data) {
          setStatus('success');
          setMessage("Email verified successfully!");
          toast.success("Email verified!");
          
          setTimeout(() => {
            router.push("/dashboard/student");
          }, 2000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        setMessage("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-yellow-500/20 p-8 text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
              {status === 'loading' && "Verifying Email"}
              {status === 'success' && "Email Verified!"}
              {status === 'error' && "Verification Failed"}
            </h1>
            <p className="text-slate-400">
              {message}
            </p>
          </div>
          
          {status === 'success' && (
            <p className="text-sm text-slate-500 mb-4">
              Redirecting to your dashboard...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Please request a new verification email or contact support.
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <Card className="glass border-yellow-500/20 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            Verifying Email
          </h1>
          <p className="text-slate-400">Loading...</p>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

