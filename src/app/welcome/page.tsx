"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Play,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Agent",
    description: "24/7 intelligent customer support that understands context and provides instant, accurate responses.",
  },
  {
    icon: Users,
    title: "Lead Qualification",
    description: "Automatically score and prioritize leads based on behavior, budget, and timeline.",
  },
  {
    icon: Sparkles,
    title: "Service Recommendations",
    description: "AI-powered suggestions that match customers with the perfect service packages.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track conversions, revenue, and agent performance with beautiful dashboards.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automate appointment booking and send reminders to reduce no-shows.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Respond to inquiries in milliseconds, not hours. Never lose a lead again.",
  },
];

const stats = [
  { value: "95%", label: "Faster Response Time" },
  { value: "80%", label: "Less Manual Work" },
  { value: "3x", label: "More Qualified Leads" },
  { value: "24/7", label: "Availability" },
];

const testimonials = [
  {
    quote: "We went from 15% to 28% conversion rate in the first month. AgentsFlowAI pays for itself many times over.",
    author: "Sarah Johnson",
    role: "CEO, Digital Marketing Agency",
    avatar: "S",
  },
  {
    quote: "AgentsFlowAI handles 90% of our initial inquiries. Our team now focuses only on closing deals.",
    author: "Michael Chen",
    role: "Founder, Web Development Studio",
    avatar: "M",
  },
  {
    quote: "Best investment we made. The AI qualification is incredibly accurate and saves us 20+ hours per week.",
    author: "Emily Davis",
    role: "Sales Director, SaaS Startup",
    avatar: "E",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 999,
    description: "Perfect for small businesses getting started",
    features: [
      "AI Chat Agent",
      "Up to 500 conversations/month",
      "Basic lead scoring",
      "Email support",
      "1 team member",
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: 2499,
    description: "Scale your business with advanced automation",
    features: [
      "Everything in Starter",
      "Unlimited conversations",
      "Advanced AI qualification",
      "Priority support",
      "5 team members",
      "Custom integrations",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 4999,
    description: "Complete digital transformation solution",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "Custom AI training",
      "24/7 phone support",
      "Unlimited team members",
      "White-label options",
      "SLA guarantee",
      "API access",
    ],
    popular: false,
  },
];

const useCases = [
  {
    title: "Digital Marketing Agencies",
    description: "Qualify leads automatically and focus your team on high-value prospects.",
    icon: TrendingUp,
  },
  {
    title: "Consulting Firms",
    description: "Provide instant expert recommendations and book consultations 24/7.",
    icon: Users,
  },
  {
    title: "SaaS Companies",
    description: "Route leads intelligently between self-serve and enterprise sales tracks.",
    icon: Zap,
  },
  {
    title: "E-commerce Businesses",
    description: "Deliver instant customer support and product recommendations.",
    icon: MessageSquare,
  },
];

export default function WelcomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for reaching out! We'll be in touch within 24 hours.");
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">AgentsFlowAI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/chat">
                  Try AI Chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#how-it-works" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </a>
              <a href="#pricing" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </a>
              <a href="#testimonials" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </a>
              <a href="#contact" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </a>
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/chat">Try AI Chat</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Business Automation
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Transform Your Business with{" "}
              <span className="text-primary">Intelligent Automation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AgentsFlowAI combines multiple AI agents to handle customer interactions, 
              qualify leads, recommend services, and provide real-time analytics — all automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Try AI Chat Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of AI-powered tools designed to automate your business 
              and help you focus on what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI agents work together seamlessly to automate your entire customer journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Customer Arrives</h3>
              </div>
              <p className="text-muted-foreground ml-14">
                A potential customer visits your website or reaches out through any channel. 
                Our AI Chat Agent engages them instantly.
              </p>
              <div className="hidden md:block absolute top-5 left-full w-full h-0.5 bg-border -translate-x-1/2" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">AI Qualifies & Recommends</h3>
              </div>
              <p className="text-muted-foreground ml-14">
                The Lead Qualification Agent scores the lead while the Service Recommender 
                suggests the perfect package based on their needs.
              </p>
              <div className="hidden md:block absolute top-5 left-full w-full h-0.5 bg-border -translate-x-1/2" />
            </div>

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Convert & Analyze</h3>
              </div>
              <p className="text-muted-foreground ml-14">
                Appointments are scheduled automatically, and you get real-time analytics 
                on every interaction to optimize your funnel.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link href="/leads/new">
                Add Your First Lead
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Growing Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a solo founder or an established agency, AgentsFlowAI scales with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="flex gap-4 p-6 rounded-xl bg-background border hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <useCase.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-xl scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/chat">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include 14-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about transforming their business with AgentsFlowAI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary rounded-3xl p-12 text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already using AgentsFlowAI to automate 
              their customer interactions and scale faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/chat">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="#contact">Contact Sales</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Badge variant="outline" className="mb-4">Contact Us</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Let's Talk About Your Needs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions? Want a personalized demo? Our team is here to help 
                you find the perfect solution for your business.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">hello@agentsflowai.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company</label>
                    <Input
                      placeholder="Your Company"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Tell us about your needs..."
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold">AgentsFlowAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your business with AI-powered automation. Qualify leads, 
                engage customers, and scale faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><Link href="/chat" className="hover:text-primary">AI Chat</Link></li>
                <li><Link href="/" className="hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#contact" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              © 2024 AgentsFlowAI. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
