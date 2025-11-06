'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Shield, CheckCircle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
}

export function OTPVerification({ email, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        toast.success('Email verified successfully!');
        onVerified();
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('An error occurred during verification');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent successfully!');
      } else {
        toast.error(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('An error occurred while resending OTP');
      console.error('OTP resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <Card className="max-w-md mx-auto border-green-500/20 bg-green-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            Email Verified
          </CardTitle>
          <CardDescription className="text-green-200">
            Your email has been successfully verified!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border-yellow-500/20 bg-yellow-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Shield className="h-5 w-5" />
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-yellow-200">
          We&apos;ve sent a verification code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-yellow-200 mb-2">
              Enter verification code
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-yellow-300 text-center">
            Didn&apos;t receive the code? Click the mail icon to resend
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

