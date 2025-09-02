import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobRoleCard } from "@/components/job-role-card";
import { MentorChat } from "@/components/mentor-chat";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { TerminalWindow, TerminalPrompt } from "@/components/terminal-window";
import { TypingEffect } from "@/components/typing-effect";
import { useToast } from "@/hooks/use-toast";
import { useProgress } from "@/hooks/use-progress";
import { jobRoles } from "@/lib/job-roles";
import { useState } from "react";

export default function Home() {
  const { overallStats } = useProgress();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "beginner" | "advanced"
  >("all");
  const { toast } = useToast();

  const filteredRoles = jobRoles.filter((role) => {
    if (selectedFilter === "beginner")
      return (
        role.difficulty === "Beginner" || role.difficulty === "Intermediate"
      );
    if (selectedFilter === "advanced") return role.difficulty === "Advanced";
    return true;
  });

  const terminalMessages = [
    "Ready to hack the matrix",
    "Initializing AI mentor systems",
    "Loading cybersecurity modules",
    "Your cyber journey begins now",
  ];

  // Handler for coming soon features
  const handleComingSoon = (featureName: string) => {
    toast({
      title: "Feature Coming Soon!",
      description: `${featureName} is currently under development and will be available in a future update.`,
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Matrix Rain Background */}
      <div className="matrix-bg">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/5 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="text-2xl font-bold text-primary terminal-text"
                data-testid="text-brand-name"
              >
                <i className="fas fa-shield-alt mr-2"></i>
                AI Cyber Mentor
              </div>
              <div className="text-sm text-muted-foreground">
                by{" "}
                <span className="text-accent font-semibold">Jit Banerjee</span>
              </div>
            </div>
            <div className="flex items-center space-x-4"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Your Cyber Security Command Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Your AI-powered cybersecurity mentor is here to guide you through
            penetration testing, ethical hacking, and advanced security
            methodologies with 6+ years of field experience.
          </p>
          <TerminalWindow className="max-w-2xl mx-auto">
            <TerminalPrompt>
              <TypingEffect
                messages={terminalMessages}
                className="text-accent"
              />
            </TerminalPrompt>
          </TerminalWindow>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="tool-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-2xl font-bold text-primary"
                  data-testid="stat-job-roles"
                >
                  {jobRoles.length}
                </div>
                <i className="fas fa-user-shield text-primary text-xl"></i>
              </div>
              <div className="text-sm text-muted-foreground">
                Job Roles Available
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full w-3/4"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="tool-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-2xl font-bold text-accent"
                  data-testid="stat-concepts"
                >
                  {overallStats.totalConceptsCompleted}
                </div>
                <i className="fas fa-brain text-accent text-xl"></i>
              </div>
              <div className="text-sm text-muted-foreground">
                Concepts Completed
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-accent h-2 rounded-full w-4/5"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="tool-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-2xl font-bold text-blue-400"
                  data-testid="stat-assessments"
                >
                  {overallStats.totalAssessments}
                </div>
                <i className="fas fa-flask text-blue-400 text-xl"></i>
              </div>
              <div className="text-sm text-muted-foreground">
                Assessments Taken
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-blue-400 h-2 rounded-full w-2/3"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="tool-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-yellow-400">24/7</div>
                <i className="fas fa-robot text-yellow-400 text-xl"></i>
              </div>
              <div className="text-sm text-muted-foreground">
                AI Mentor Support
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-yellow-400 h-2 rounded-full w-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Role Selection Hub */}
        <section className="mb-16">
          <div className="flex flex-col gap-4 lg:gap-0 lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              <i className="fas fa-briefcase text-primary mr-3"></i>
              Choose Your Cybersecurity Path
            </h2>
            <div className="flex space-x-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "secondary"}
                onClick={() => setSelectedFilter("all")}
                data-testid="filter-all-roles"
              >
                All Roles
              </Button>
              <Button
                variant={
                  selectedFilter === "beginner" ? "default" : "secondary"
                }
                onClick={() => setSelectedFilter("beginner")}
                data-testid="filter-beginner-roles"
              >
                Beginner
              </Button>
              <Button
                variant={
                  selectedFilter === "advanced" ? "default" : "secondary"
                }
                onClick={() => setSelectedFilter("advanced")}
                data-testid="filter-advanced-roles"
              >
                Advanced
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <JobRoleCard key={role.id} role={role} />
            ))}
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <i className="fas fa-tools text-primary mr-3"></i>
            Your Cybersecurity Toolkit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Practice Simulator */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-practice-simulator"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Cybersecurity practice simulator environment"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-accent">
                  Practice Simulator
                </h3>
                <p className="text-muted-foreground mb-6">
                  Hands-on guided exercises in safe, sandboxed environments with
                  real-time mentor feedback.
                </p>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
                  data-testid="button-start-practice"
                  onClick={() => handleComingSoon("Practice Simulator")}
                >
                  Start Practice Session
                </Button>
              </CardContent>
            </Card>

            {/* Knowledge Assessment */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-knowledge-assessment"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Cybersecurity knowledge assessment dashboard"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-blue-400">
                  Knowledge Assessment
                </h3>
                <p className="text-muted-foreground mb-6">
                  Adaptive questioning system that evaluates your understanding
                  and identifies knowledge gaps.
                </p>
                <Button
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  data-testid="button-take-assessment"
                  onClick={() => handleComingSoon("Knowledge Assessment")}
                >
                  Take Assessment
                </Button>
              </CardContent>
            </Card>

            {/* Methodology Builder */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-methodology-builder"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Penetration testing methodology planning workspace"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">
                  Methodology Builder
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create custom penetration testing workflows and security
                  assessment procedures.
                </p>
                <Button
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                  data-testid="button-build-methodology"
                  onClick={() => handleComingSoon("Methodology Builder")}
                >
                  Build Methodology
                </Button>
              </CardContent>
            </Card>

            {/* Career Roadmap */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-career-roadmap"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Cybersecurity career development path"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-purple-400">
                  Career Roadmap
                </h3>
                <p className="text-muted-foreground mb-6">
                  Personalized learning paths with certification planning and
                  skill development tracking.
                </p>
                <Button
                  className="w-full bg-purple-500 text-white hover:bg-purple-600"
                  data-testid="button-plan-career"
                  onClick={() => handleComingSoon("Career Roadmap")}
                >
                  Plan Your Career
                </Button>
              </CardContent>
            </Card>

            {/* Case Study Analyzer */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-case-study-analyzer"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Security incident analysis dashboard"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-red-400">
                  Case Study Analyzer
                </h3>
                <p className="text-muted-foreground mb-6">
                  Learn from real-world breaches and security incidents with
                  detailed analysis and lessons.
                </p>
                <Button
                  className="w-full bg-red-500 text-white hover:bg-red-600"
                  data-testid="button-analyze-cases"
                  onClick={() => handleComingSoon("Case Study Analyzer")}
                >
                  Analyze Cases
                </Button>
              </CardContent>
            </Card>

            {/* Toolkit Generator */}
            <Card
              className="tool-card text-center group cursor-pointer"
              data-testid="tool-toolkit-generator"
            >
              <CardContent className="p-8">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Ethical hacking toolkit workspace"
                  className="rounded-xl mb-6 w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <h3 className="text-2xl font-bold mb-4 text-green-400">
                  Toolkit Generator
                </h3>
                <p className="text-muted-foreground mb-6">
                  Generate custom checklists, playbooks, and procedures for your
                  security operations.
                </p>
                <Button
                  className="w-full bg-green-500 text-black hover:bg-green-400"
                  data-testid="button-generate-tools"
                  onClick={() => handleComingSoon("Toolkit Generator")}
                >
                  Generate Tools
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Live Mentor Chat */}
        <section className="mb-16">
          <MentorChat />
        </section>

        {/* Progress Dashboard */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            <i className="fas fa-chart-line text-primary mr-3"></i>
            Your Learning Progress
          </h2>
          <ProgressDashboard />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="text-lg font-bold text-primary terminal-text">
                AI Cyber Mentor
              </div>
              <div className="text-sm text-muted-foreground">
                Empowering the next generation of cybersecurity professionals
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-muted-foreground">
                Mentored by{" "}
                <span className="text-accent font-semibold">Jit Banerjee</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Sponsored by{" "}
                <span className="text-primary font-semibold">
                  Cedar Pro Academy
                </span>
              </div>
              <div className="flex space-x-4">
                <i className="fab fa-github text-muted-foreground hover:text-primary cursor-pointer transition-colors"></i>
                <i className="fab fa-linkedin text-muted-foreground hover:text-primary cursor-pointer transition-colors"></i>
                <i className="fab fa-twitter text-muted-foreground hover:text-primary cursor-pointer transition-colors"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
