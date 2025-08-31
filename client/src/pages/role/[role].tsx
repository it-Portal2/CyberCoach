import { useRoute } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MentorChat } from "@/components/mentor-chat";
import { getRoleById, getCategoryColors } from "@/lib/job-roles";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";

export default function RolePage() {
  const [, params] = useRoute("/role/:role");
  const roleId = params?.role;
  const role = roleId ? getRoleById(roleId) : null;
  const { getRoleProgress } = useProgress();

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Role Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The requested cybersecurity role could not be found.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colors = getCategoryColors(role.category);
  const progress = getRoleProgress(role.id);

  const realWorldExamples = [
    {
      title: "Enterprise Network Breach Response",
      description:
        "How a Fortune 500 company detected and contained an APT attack targeting their intellectual property.",
      impact: "Critical",
      duration: "72 hours",
      techniques: ["Lateral Movement", "Data Exfiltration", "Persistence"],
    },
    {
      title: "Social Engineering Campaign",
      description:
        "Multi-phase phishing operation that bypassed technical controls through human psychology.",
      impact: "High",
      duration: "2 weeks",
      techniques: ["Spear Phishing", "Pretexting", "OSINT"],
    },
    {
      title: "Cloud Infrastructure Assessment",
      description:
        "Comprehensive security review of multi-cloud deployment with zero-trust implementation.",
      impact: "Medium",
      duration: "1 week",
      techniques: [
        "Configuration Review",
        "IAM Analysis",
        "Network Segmentation",
      ],
    },
  ];

  const methodology = [
    {
      phase: "1. Scope & Authorization",
      description:
        "Define engagement boundaries and obtain proper authorization",
      details: [
        "Rules of Engagement",
        "Legal Authorization",
        "Target Definition",
        "Timeline Establishment",
      ],
    },
    {
      phase: "2. Reconnaissance",
      description: "Gather information about the target environment",
      details: [
        "OSINT Collection",
        "Network Discovery",
        "Service Enumeration",
        "Vulnerability Identification",
      ],
    },
    {
      phase: "3. Vulnerability Analysis",
      description: "Analyze discovered vulnerabilities for exploitability",
      details: [
        "Risk Assessment",
        "Exploit Validation",
        "Attack Vector Analysis",
        "Impact Evaluation",
      ],
    },
    {
      phase: "4. Safe Exploitation",
      description: "Demonstrate vulnerabilities in controlled environment",
      details: [
        "Proof of Concept",
        "Evidence Collection",
        "Privilege Escalation",
        "Persistence Testing",
      ],
    },
    {
      phase: "5. Post-Exploitation Analysis",
      description: "Assess the impact and potential damage",
      details: [
        "Data Access Review",
        "System Compromise Assessment",
        "Lateral Movement Testing",
        "Cleanup",
      ],
    },
    {
      phase: "6. Reporting",
      description: "Document findings and provide remediation guidance",
      details: [
        "Executive Summary",
        "Technical Details",
        "Risk Ratings",
        "Remediation Recommendations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between sm:space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-back-home"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${colors.bg} rounded-lg`}>
                  <i className={`${role.icon} ${colors.text} text-xl`}></i>
                </div>
                <div>
                  <h1 className="sm:text-2xl font-bold text-foreground">
                    {role.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`${colors.bg} ${colors.text} border-current text-xs`}
                  >
                    {role.category}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Progress:{" "}
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Role Overview */}
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle text-primary mr-2"></i>
                  Role Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{role.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">
                      Core Skills
                    </h4>
                    <div className="space-y-2">
                      {role.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-2 h-2 ${colors.text.replace(
                              "text-",
                              "bg-"
                            )} rounded-full`}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">
                      Relevant Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {role.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultValue="examples" className="w-full">
              <TabsList className="flex flex-col h-full w-full sm:grid sm:grid-cols-3 bg-secondary">
                <TabsTrigger
                  value="examples"
                  data-testid="tab-examples"
                  className="w-full"
                >
                  Real-World Examples
                </TabsTrigger>
                <TabsTrigger
                  value="methodology"
                  data-testid="tab-methodology"
                  className="w-full"
                >
                  Methodology
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  data-testid="tab-resources"
                  className="w-full"
                >
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="examples" className="mt-6">
                <Card className="tool-card">
                  <CardHeader>
                    <CardTitle>Real-World Case Studies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {realWorldExamples.map((example, index) => (
                        <Card key={index} className="bg-secondary/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-foreground">
                                {example.title}
                              </h4>
                              <Badge
                                variant={
                                  example.impact === "Critical"
                                    ? "destructive"
                                    : example.impact === "High"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {example.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {example.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {example.techniques.map((technique, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                                  >
                                    {technique}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Duration: {example.duration}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methodology" className="mt-6">
                <Card className="tool-card">
                  <CardHeader>
                    <CardTitle>Step-by-Step Methodology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {methodology.map((phase, index) => (
                        <AccordionItem key={index} value={`phase-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-sm font-bold`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {phase.phase}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {phase.description}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="ml-11 space-y-2">
                              {phase.details.map((detail, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  <span className="text-sm text-muted-foreground">
                                    {detail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card className="tool-card">
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-secondary/30">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 text-foreground">
                            <i className="fas fa-book text-primary mr-2"></i>
                            Documentation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• OWASP Testing Guide</li>
                            <li>• PTES Technical Guidelines</li>
                            <li>• NIST Cybersecurity Framework</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-secondary/30">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 text-foreground">
                            <i className="fas fa-tools text-accent mr-2"></i>
                            Essential Tools
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Nmap</li>
                            <li>• Burp Suite</li>
                            <li>• Metasploit</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/practice/${role.id}`}>
                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
                  data-testid="button-start-practice-mode"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Practice Mode
                </Button>
              </Link>

              <Link href={`/assessment/${role.id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  data-testid="button-knowledge-check"
                >
                  <i className="fas fa-clipboard-check mr-2"></i>
                  Knowledge Check
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar - Mentor Chat */}
          <div className="lg:col-span-1">
            <MentorChat jobRole={role.name} className="sticky top-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
