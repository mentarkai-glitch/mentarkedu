'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';

export default function SettingsPage() {
  return (
    <PageLayout containerWidth="narrow" padding="desktop" maxWidth="4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
          icon={<Settings className="w-8 h-8 text-gold" />}
        />
        <PageContainer spacing="md">
          {/* Settings content will go here */}
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}

