"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Play, ArrowRight } from "lucide-react";

export default function DemoPage() {
  // Placeholder video URL - replace with actual demo video URL
  const demoVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Replace with actual video

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <motion.section
          className="container mx-auto px-4 py-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="border-primary/30 bg-primary/10 text-primary mb-4">
            Product Demo
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6 text-foreground">
            See Mentark in Action
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how Mentark helps students create personalized roadmaps, get AI-powered guidance, 
            and make informed decisions about their academic and career journey.
          </p>
        </motion.section>

        {/* Video Section */}
        <motion.section
          className="container mx-auto px-4 py-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-5xl mx-auto">
            <Card className="border-border bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-background">
                  <iframe
                    src={demoVideoUrl}
                    title="Mentark Product Demo"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Features Highlight */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl mb-8 text-center text-foreground">
              What You&apos;ll See in This Demo
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "ARK Generation - How students create personalized adaptive roadmaps",
                "Daily Mentor - AI-powered guidance and motivation",
                "College Matcher - Smart recommendations based on student profile",
                "Document AI - Automated resume, SOP, and report generation",
                "B2B Dashboard - Institute analytics and student progress tracking",
                "Emotion Tracking - Burnout detection and wellbeing insights",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50"
                >
                  <Play className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">{feature}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">Ready for a Full Demo?</h2>
            <p className="text-muted-foreground mb-8">
              Schedule a personalized walkthrough with our team. We&apos;ll show you exactly how Mentark 
              can help your students or institute achieve better outcomes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
                <Link href="/contact">
                  Request Full Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40 text-primary">
                <Link href="/product">Explore Product</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}

