"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, Linkedin, MapPin, Send } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState<string>("");

  const emailJsServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const isEmailJsConfigured = emailJsServiceId && emailJsTemplateId && emailJsPublicKey;

  const handleChange = (field: keyof typeof formState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setFormMessage("");

    if (!isEmailJsConfigured) {
      setFormStatus("error");
      setFormMessage("Contact form is not configured yet. Please email us directly at connect@mentark.com");
      return;
    }

    try {
      await emailjs.send(
        emailJsServiceId!,
        emailJsTemplateId!,
        {
          name: formState.name,
          email: formState.email,
          message: formState.message,
        },
        emailJsPublicKey
      );

      setFormStatus("success");
      setFormMessage("Your message has been sent! We'll get back to you within one business day.");
      setFormState({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("EmailJS send failed", error);
      setFormStatus("error");
      setFormMessage("Failed to send message. Please try again or email us directly at connect@mentark.com");
    }
  };

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
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
            Get in Touch
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6">
            Let&apos;s Start a Conversation
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you&apos;re a student, parent, institute, or potential partner, we&apos;d love to hear from you.
          </p>
        </motion.section>

        {/* Contact Information */}
        <motion.section
          className="container mx-auto px-4 py-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-card-foreground font-semibold mb-2">General Inquiries</h3>
                <a
                  href="mailto:connect@mentark.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  connect@mentark.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-card-foreground font-semibold mb-2">Partnerships</h3>
                <a
                  href="mailto:partnerships@mentark.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  partnerships@mentark.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-card-foreground font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground text-sm">Pune, Maharashtra, India</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground text-2xl">Send us a message</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Fill out the form below and we&apos;ll get back to you within one business day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm text-muted-foreground">
                      Name
                    </label>
                    <input
                      id="name"
                      value={formState.name}
                      onChange={handleChange("name")}
                      className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm text-muted-foreground">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formState.message}
                      onChange={handleChange("message")}
                      className="min-h-[120px] rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={formStatus === "submitting"}
                  >
                    {formStatus === "submitting" ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {formStatus === "success" && (
                    <p className="text-sm text-green-400">{formMessage}</p>
                  )}
                  {formStatus === "error" && (
                    <p className="text-sm text-red-400">{formMessage}</p>
                  )}
                  {!isEmailJsConfigured && (
                    <p className="text-xs text-yellow-300">
                      Contact form is not configured yet. Please email us directly at connect@mentark.com
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Social Links */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl mb-6">Connect with us on social media</h2>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.linkedin.com/company/mentark"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-6 w-6" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </motion.section>

      </div>
      <Footer />
    </div>
  );
}

