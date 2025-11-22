"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

const teamMembers = [
  {
    name: "Aqsa Khan",
    role: "Content & Behavioral Psychology Research Lead",
    bio: "Focus: Cognitive psychology, learning science, emotional assessment frameworks. Designs the psychological scoring system behind ARK and ensures content aligns with student cognition and motivation theory.",
  },
  {
    name: "Abdo Ali Daruwala",
    role: "Head of Sales & Strategy",
    bio: "Experienced in B2B enterprise sales, partnerships, and revenue strategy. Leading Mentark's institutional expansion — schools, colleges, and coaching networks.",
  },
  {
    name: "Preeti Sharma",
    role: "Sales Outreach Specialist",
    bio: "Driving lead generation → demo → conversion workflows. Manages institutional communication, relationship building, and local partnerships.",
  },
  {
    name: "Piyush Pachare",
    role: "AI/ML Engineer",
    bio: "Works on neural recommendation pipelines, model optimization, and LLM orchestration for Mentark Neuro & Quantum features. Ensures data-driven personalization and scaling strategies.",
  },
  {
    name: "Abhishek Nangre",
    role: "Data Analytics & Visualization Specialist",
    bio: "Builds student insight dashboards, performance analytics, and roadmap tracking systems. Responsible for visual intelligence outputs across admin & student modules.",
  },
  {
    name: "Karan Rathod",
    role: "Operations & Productivity Engineering",
    bio: "Drives execution speed — coordination between dev, sales, and content teams. Supports research pipelines, QA testing, and deployment workflows.",
  },
];

export default function TeamPage() {
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
          <Badge className="border-primary500/30 bg-primary500/10 text-primary mb-4">
            Meet the Team
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6">
            The People Behind Mentark
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re a team of builders, educators, and technologists united by a single mission: 
            making mentorship accessible to every student in India.
          </p>
        </motion.section>

        {/* Founder Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl mb-8 text-center">Founder</h2>
            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <User className="h-16 w-16 text-black" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-card-foreground mb-2">Ravi Chavan</h3>
                      <p className="text-primary font-semibold">Founder & CEO</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      A builder obsessed with solving real human problems. Background across product, marketing, growth & tech execution — experience scaling customer-facing digital products and leading multidisciplinary teams. Drives Mentark's vision, product roadmap, partnerships, and operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Team Members Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">Team Members</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-border bg-card h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                          <User className="h-12 w-12 text-black" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-card-foreground mb-1">{member.name}</h3>
                          <p className="text-primary font-semibold text-sm">{member.role}</p>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Join Us Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">Join Our Mission</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re always looking for talented people who share our passion for making mentorship accessible. 
              If you&apos;re interested in joining the team, reach out to us.
            </p>
            <a
              href="mailto:careers@mentark.com"
              className="inline-flex items-center gap-2 text-primary hover:text-yellow-200 font-semibold"
            >
              careers@mentark.com
            </a>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}


