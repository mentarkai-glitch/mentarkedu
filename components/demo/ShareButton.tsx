'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/services/analytics';

interface ShareButtonProps {
  results?: {
    stream: string;
    strengths: string[];
  };
}

export function ShareButton({ results }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    // Capture UTM params if present
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
      if (urlParams.has(param)) {
        utmParams[param] = urlParams.get(param)!;
      }
    });

    // Build share URL with UTM params
    const shareUrl = new URL(url.split('?')[0], window.location.origin);
    Object.entries(utmParams).forEach(([key, value]) => {
      shareUrl.searchParams.set(key, value);
    });
    if (results) {
      shareUrl.searchParams.set('demo_stream', results.stream);
    }

    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my Mentark Path Finder results!',
          text: `I discovered my strengths: ${results?.strengths.join(', ') || 'Take the quiz to find yours!'}`,
          url: shareUrl.toString()
        });
        trackEvent('demo_share_clicked', { method: 'native', ...utmParams });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackEvent('demo_share_clicked', { method: 'copy', ...utmParams });
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to email
      const emailSubject = encodeURIComponent('Check out Mentark Path Finder');
      const emailBody = encodeURIComponent(
        `I took the Mentark Path Finder quiz and discovered my strengths!\n\n` +
        `My best-fit stream: ${results?.stream || 'Take the quiz to find yours!'}\n\n` +
        `Try it here: ${shareUrl.toString()}`
      );
      window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
      trackEvent('demo_share_clicked', { method: 'email', ...utmParams });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="border-[#0AB3A3] text-[#0AB3A3] hover:bg-[#0AB3A3]/10"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share with Teacher
        </>
      )}
    </Button>
  );
}

