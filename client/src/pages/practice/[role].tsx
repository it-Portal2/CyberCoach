import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TerminalWindow, TerminalPrompt } from "@/components/terminal-window";
import { useToast } from "@/hooks/use-toast";
import { mentorAI } from "@/lib/mentor-ai";
import { storage } from "@/lib/storage";
import { getRoleById } from "@/lib/job-roles";

// localStorage keys
const LOCALSTORAGE_SCENARIO_KEY = "cybercoach-practice-scenario";
const LOCALSTORAGE_FEEDBACK_KEY = "cybercoach-practice-feedback";
const LOCALSTORAGE_ROLE_KEY = "cybercoach-practice-role";

// Save/load helpers
function saveScenarioToStorage(scenario: any, roleId: string) {
  localStorage.setItem(LOCALSTORAGE_SCENARIO_KEY, JSON.stringify(scenario));
  localStorage.setItem(LOCALSTORAGE_ROLE_KEY, roleId);
}

function loadScenarioFromStorage(roleId: string) {
  const savedRoleId = localStorage.getItem(LOCALSTORAGE_ROLE_KEY);
  if (savedRoleId !== roleId) {
    // Different role, clear old data
    clearScenarioStorage();
    return null;
  }
  const data = localStorage.getItem(LOCALSTORAGE_SCENARIO_KEY);
  return data ? JSON.parse(data) : null;
}

function saveFeedbackToStorage(feedbackArray: any[]) {
  localStorage.setItem(
    LOCALSTORAGE_FEEDBACK_KEY,
    JSON.stringify(feedbackArray)
  );
}

function loadFeedbackFromStorage(roleId: string) {
  const savedRoleId = localStorage.getItem(LOCALSTORAGE_ROLE_KEY);
  if (savedRoleId !== roleId) {
    return [];
  }
  const data = localStorage.getItem(LOCALSTORAGE_FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
}

function clearScenarioStorage() {
  localStorage.removeItem(LOCALSTORAGE_SCENARIO_KEY);
  localStorage.removeItem(LOCALSTORAGE_FEEDBACK_KEY);
  localStorage.removeItem(LOCALSTORAGE_ROLE_KEY);
}

export default function PracticePage() {
  const [, params] = useRoute("/practice/:role");
  const roleId = params?.role;
  const role = roleId ? getRoleById(roleId) : null;
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [userApproach, setUserApproach] = useState("");
  const [feedback, setFeedback] = useState<any[]>([]);

  // Separate loading states
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);

  const [difficulty, setDifficulty] = useState("Intermediate");
  const [topic, setTopic] = useState("");
  const { toast } = useToast();

  const practiceTopics = [
    "Network Reconnaissance",
    "Vulnerability Assessment",
    "Web Application Testing",
    "Social Engineering",
    "Incident Response",
    "Threat Hunting",
    "Malware Analysis",
    "Cloud Security",
  ];

  // Load saved data on mount
  useEffect(() => {
    if (role && roleId) {
      const savedScenario = loadScenarioFromStorage(roleId);
      if (savedScenario) {
        setCurrentScenario(savedScenario);
        console.log("Loaded saved scenario:", savedScenario);
      }

      const savedFeedback = loadFeedbackFromStorage(roleId);
      if (savedFeedback && savedFeedback.length > 0) {
        setFeedback(savedFeedback);
        console.log("Loaded saved feedback:", savedFeedback.length, "items");
      }
    }
  }, [role, roleId]);

  // Only generate new scenario if none exists and none saved
  useEffect(() => {
    if (role && roleId && !currentScenario && !isGeneratingScenario) {
      const savedScenario = loadScenarioFromStorage(roleId);
      if (!savedScenario) {
        console.log("No saved scenario found, generating new one...");
        generateNewScenario();
      }
    }
  }, [role, roleId, currentScenario, isGeneratingScenario]);

  const generateNewScenario = async () => {
    if (!role || !roleId) return;

    setIsGeneratingScenario(true);
    try {
      const scenario = await mentorAI.generatePractice(
        role.name,
        difficulty,
        topic || practiceTopics[0]
      );

      setCurrentScenario(scenario);
      setFeedback([]);
      setUserApproach("");

      // Save to localStorage
      saveScenarioToStorage(scenario, roleId);
      saveFeedbackToStorage([]);

      // Track activity
      storage.addActivity({
        type: "scenario",
        title: `Generated: ${scenario.title || "New Scenario"}`,
        description: `New practice scenario generated for ${role.name}`,
        role: role.name,
        xp: 25,
      });

      console.log("Generated and saved new scenario");
    } catch (error) {
      console.error("Scenario generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate practice scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const submitApproach = async () => {
    if (!userApproach.trim() || !currentScenario) return;

    setIsGettingFeedback(true);
    try {
      const mentorResponse = await mentorAI.askMentor({
        message: `I'm working on this practice scenario: "${currentScenario.scenario}". Here's my approach: ${userApproach}. Please provide feedback and guidance.`,
        jobRole: role?.name,
        context: "practice session feedback",
      });

      const newFeedback = {
        userApproach,
        mentorResponse,
        timestamp: new Date(),
      };

      const updatedFeedback = [...feedback, newFeedback];
      setFeedback(updatedFeedback);
      setUserApproach("");

      // Save feedback to localStorage
      saveFeedbackToStorage(updatedFeedback);

      // Save progress
      storage.updateProgress(
        role!.id,
        Math.min(100, storage.getProgress(role!.id) + 5)
      );

      // Track activity
      storage.addActivity({
        type: "practice",
        title: `Practice: ${currentScenario?.title || "Scenario"}`,
        description: "Completed practice scenario and received mentor feedback",
        role: role?.name,
        xp: 85,
      });

      console.log("Feedback saved to localStorage");
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        title: "Error",
        description: "Failed to get mentor feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGettingFeedback(false);
    }
  };
  const handleComingSoon = (featureName: string) => {
    toast({
      title: "Feature Coming Soon!",
      description: `${featureName} is currently under development and will be available in a future update.`,
      variant: "default",
    });
  };
  // Clear saved data and generate new scenario
  const clearAndGenerateNew = () => {
    if (roleId) {
      clearScenarioStorage();
      setCurrentScenario(null);
      setFeedback([]);
      setUserApproach("");
      generateNewScenario();
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Role Not Found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between sm:space-x-4">
              <Link href={`/role/${role.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-back-role"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to {role.name}
                </Button>
              </Link>
              <h1 className="md:text-2xl font-bold text-foreground">
                <i className="fas fa-play text-accent mr-2"></i>
                Practice Mode
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {currentScenario && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAndGenerateNew}
                  disabled={isGeneratingScenario}
                  className="text-accent border-accent"
                >
                  <i className="fas fa-refresh mr-1"></i>
                  New Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Scenario Setup */}
        <Card className="tool-card mb-8">
          <CardHeader>
            <CardTitle>Practice Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger data-testid="select-topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceTopics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearAndGenerateNew}
                  disabled={isGeneratingScenario}
                  className="w-full"
                  data-testid="button-generate-scenario"
                >
                  {isGeneratingScenario ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt mr-2"></i>
                      Generate New Scenario
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State - Only for initial scenario generation */}
        {isGeneratingScenario && !currentScenario && (
          <Card className="tool-card">
            <CardContent className="p-12 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Generating Practice Scenario
              </h3>
              <p className="text-muted-foreground">
                Our AI mentor is creating a personalized practice scenario based
                on your selected role and difficulty level...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Scenario */}
        {currentScenario && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scenario Details */}
            <div className="space-y-6">
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Current Scenario
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Persisted
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">
                        Scenario
                      </h4>
                      <p className="text-muted-foreground">
                        {currentScenario.scenario}
                      </p>
                    </div>

                    {currentScenario.objectives && (
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">
                          Objectives
                        </h4>
                        <ul className="space-y-1">
                          {currentScenario.objectives.map(
                            (obj: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-center space-x-2 text-sm text-muted-foreground"
                              >
                                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                <span>{obj}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {currentScenario.safetyNotes && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <h4 className="font-semibold mb-2 text-yellow-400 flex items-center">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Safety Notes
                        </h4>
                        <ul className="space-y-1">
                          {currentScenario.safetyNotes.map(
                            (note: string, idx: number) => (
                              <li key={idx} className="text-xs text-yellow-300">
                                • {note}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Input */}
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle>Your Approach</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe your approach to this scenario. What steps would you take? What tools would you use?"
                    value={userApproach}
                    onChange={(e) => setUserApproach(e.target.value)}
                    className="min-h-32 mb-4"
                    data-testid="textarea-user-approach"
                  />
                  <Button
                    onClick={submitApproach}
                    disabled={!userApproach.trim() || isGettingFeedback}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
                    data-testid="button-submit-approach"
                  >
                    {isGettingFeedback ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Getting Feedback...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Get Mentor Feedback
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Panel */}
            <div className="space-y-6">
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-comments text-primary mr-2"></i>
                    Mentor Feedback
                    {feedback.length > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {feedback.length} saved
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGettingFeedback ? (
                    // Loading skeleton for feedback
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <div className="h-4 bg-secondary/50 rounded mb-2"></div>
                          <div className="h-3 bg-secondary/40 rounded"></div>
                        </div>
                      </div>
                      <div className="animate-pulse">
                        <div className="bg-primary rounded-lg p-4">
                          <div className="h-4 bg-primary rounded mb-2"></div>
                          <div className="h-3 bg-primary rounded mb-2"></div>
                          <div className="h-3 bg-primary rounded mb-4"></div>
                          <div className="space-y-1">
                            <div className="h-2 bg-primary rounded"></div>
                            <div className="h-2 bg-primary rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center py-4">
                        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-primary font-semibold text-sm">
                          Getting feedback from mentor...
                        </p>
                      </div>
                    </div>
                  ) : feedback.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-comment-slash text-muted-foreground text-4xl mb-4"></i>
                      <p className="text-muted-foreground">
                        Submit your approach to get detailed feedback from your
                        AI mentor.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {feedback.map((item, index) => (
                        <div
                          key={index}
                          className="space-y-3 border-b border-border/30 pb-4 last:border-b-0"
                        >
                          <div className="bg-secondary/30 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">
                              Your Approach:
                            </div>
                            <div className="text-sm">{item.userApproach}</div>
                          </div>

                          <div className="bg-primary/10 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-primary font-semibold">
                                Mentor Feedback:
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {item.mentorResponse.confidence}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              {item.mentorResponse.response}
                            </div>

                            {item.mentorResponse.hints &&
                              item.mentorResponse.hints.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs text-yellow-400 font-semibold mb-1">
                                    Next Steps:
                                  </div>
                                  <ul className="space-y-1">
                                    {item.mentorResponse.hints.map(
                                      (hint: string, idx: number) => (
                                        <li
                                          key={idx}
                                          className="text-xs text-muted-foreground"
                                        >
                                          • {hint}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    data-testid="button-ask-hint"
                    onClick={() => handleComingSoon("Practice Simulator")}
                  >
                    <i className="fas fa-lightbulb mr-2"></i>
                    Ask for Hint
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    data-testid="button-request-methodology"
                    onClick={() => handleComingSoon("Practice Simulator")}
                  >
                    <i className="fas fa-list-ol mr-2"></i>
                    Request Methodology
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    data-testid="button-check-progress"
                    onClick={() => handleComingSoon("Practice Simulator")}
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    Check Progress
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
