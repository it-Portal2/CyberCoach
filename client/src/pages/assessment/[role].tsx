import { useRoute, Link } from 'wouter';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mentorAI } from '@/lib/mentor-ai';
import { storage } from '@/lib/storage';
import { getRoleById } from '@/lib/job-roles';

// localStorage keys
const LOCALSTORAGE_ASSESSMENT_KEY = 'cybercoach-assessment-session';
const LOCALSTORAGE_ASSESSMENT_ROLE_KEY = 'cybercoach-assessment-role';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  points: number;
}

interface AssessmentSession {
  questions: Question[];
  currentQuestion: number;
  selectedAnswers: Record<number, string>;
  showResults: boolean;
  score: number;
  topic: string;
  roleId: string;
  startedAt: string;
  completedAt?: string;
}

// Save/load helpers
function saveAssessmentSession(session: AssessmentSession) {
  localStorage.setItem(LOCALSTORAGE_ASSESSMENT_KEY, JSON.stringify(session));
  localStorage.setItem(LOCALSTORAGE_ASSESSMENT_ROLE_KEY, session.roleId);
}

function loadAssessmentSession(roleId: string): AssessmentSession | null {
  const savedRoleId = localStorage.getItem(LOCALSTORAGE_ASSESSMENT_ROLE_KEY);
  if (savedRoleId !== roleId) {
    // Different role, clear old data
    clearAssessmentSession();
    return null;
  }
  const data = localStorage.getItem(LOCALSTORAGE_ASSESSMENT_KEY);
  return data ? JSON.parse(data) : null;
}

function clearAssessmentSession() {
  localStorage.removeItem(LOCALSTORAGE_ASSESSMENT_KEY);
  localStorage.removeItem(LOCALSTORAGE_ASSESSMENT_ROLE_KEY);
}

export default function AssessmentPage() {
  const [, params] = useRoute('/assessment/:role');
  const roleId = params?.role;
  const role = roleId ? getRoleById(roleId) : null;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();

  const assessmentTopics = [
    'Network Security Fundamentals',
    'Web Application Security',
    'Incident Response Procedures',
    'Threat Intelligence Analysis',
    'Penetration Testing Methodology',
    'Social Engineering Defense',
    'Cloud Security Best Practices',
    'Malware Analysis Techniques'
  ];

  // Load saved assessment session on mount
  useEffect(() => {
    if (role && roleId) {
      const savedSession = loadAssessmentSession(roleId);
      if (savedSession) {
        setQuestions(savedSession.questions);
        setCurrentQuestion(savedSession.currentQuestion);
        setSelectedAnswers(savedSession.selectedAnswers);
        setShowResults(savedSession.showResults);
        setScore(savedSession.score);
        setTopic(savedSession.topic);
        console.log('Loaded saved assessment session:', savedSession);
      }
    }
  }, [role, roleId]);

  // Auto-save assessment session whenever state changes
  useEffect(() => {
    if (roleId && (questions.length > 0 || showResults)) {
      const session: AssessmentSession = {
        questions,
        currentQuestion,
        selectedAnswers,
        showResults,
        score,
        topic,
        roleId,
        startedAt: new Date().toISOString(),
        completedAt: showResults ? new Date().toISOString() : undefined
      };
      saveAssessmentSession(session);
    }
  }, [questions, currentQuestion, selectedAnswers, showResults, score, topic, roleId]);

  const generateAssessment = async () => {
    if (!role || !topic) return;
    
    setIsLoading(true);
    try {
      const assessmentData = await mentorAI.generateAssessment(role.name, topic, 5);
      const generatedQuestions = assessmentData.questions || assessmentData;
      
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
      setScore(0);

      // Save the new assessment session
      const newSession: AssessmentSession = {
        questions: generatedQuestions,
        currentQuestion: 0,
        selectedAnswers: {},
        showResults: false,
        score: 0,
        topic,
        roleId: roleId!,
        startedAt: new Date().toISOString()
      };
      saveAssessmentSession(newSession);

      console.log('Generated and saved new assessment');
    } catch (error) {
      console.error('Assessment generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitAssessment = () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, index) => {
      totalPoints += q.points || 10;
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
        earnedPoints += q.points || 10;
      }
    });

    const finalScore = Math.round((earnedPoints / totalPoints) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Save assessment result to your existing storage system
    const result = {
      jobRole: role!.id,
      assessmentType: 'knowledge-check' as const,
      topic,
      questions: questions.map((q, index) => ({
        question: q.question,
        userAnswer: selectedAnswers[index] || '',
        correctAnswer: q.correctAnswer,
        score: selectedAnswers[index] === q.correctAnswer ? 100 : 0,
        feedback: q.explanation
      })),
      totalScore: finalScore,
      completedAt: new Date()
    };

    storage.saveAssessmentResult(result);
    
    // Update progress
    const progressBonus = Math.max(5, Math.floor(finalScore / 10));
    storage.updateProgress(role!.id, Math.min(100, storage.getProgress(role!.id) + progressBonus));
    
    // Track activity
    storage.addActivity({
      type: 'assessment',
      title: `Assessment: ${role!.name}`,
      description: `Completed knowledge assessment with ${finalScore}% score`,
      role: role!.name,
      xp: Math.max(100, finalScore * 2)
    });

    console.log('Assessment completed and saved');
  };

  const resetAssessment = () => {
    if (roleId) {
      clearAssessmentSession();
    }
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setTopic('');
    console.log('Assessment session cleared');
  };

  const startNewAssessment = () => {
    resetAssessment();
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
        <div className=" px-4 py-4">
          <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between md:space-x-4">
              <Link href={`/role/${role.id}`}>
                <Button variant="ghost" size="sm" data-testid="button-back-role">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to {role.name}
                </Button>
              </Link>
              <h1 className="md:text-2xl font-bold text-foreground">
                <i className="fas fa-clipboard-check text-blue-400 mr-2"></i>
                Knowledge Assessment
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {questions.length > 0 && !showResults && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-24" />
                </div>
              )}
              {questions.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={startNewAssessment}
                  disabled={isLoading}
                  className='text-accent border-accent'
                >
                  <i className="fas fa-refresh mr-1"></i>
                  New Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Topic Selection */}
        {questions.length === 0 && !isLoading && (
          <Card className="tool-card">
            <CardHeader>
              <CardTitle>Select Assessment Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger data-testid="select-assessment-topic">
                    <SelectValue placeholder="Choose a topic to assess your knowledge" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTopics.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={generateAssessment}
                  disabled={!topic || isLoading}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  data-testid="button-start-assessment"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="tool-card">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating assessment questions...</p>
            </CardContent>
          </Card>
        )}

        {/* Assessment Questions */}
        {questions.length > 0 && !showResults && (
          <Card className="tool-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question {currentQuestion + 1}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {questions[currentQuestion]?.difficulty || 'Medium'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground">
                  {questions[currentQuestion]?.question}
                </h3>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion] || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion, value)}
                  className="space-y-3"
                >
                  {questions[currentQuestion]?.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    data-testid="button-previous-question"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </Button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={submitAssessment}
                      disabled={Object.keys(selectedAnswers).length !== questions.length}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      data-testid="button-submit-assessment"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      disabled={!selectedAnswers[currentQuestion]}
                      data-testid="button-next-question"
                    >
                      Next
                      <i className="fas fa-chevron-right ml-2"></i>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    <i className="fas fa-trophy text-yellow-400 mr-2"></i>
                    Assessment Results
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Saved
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    <span className={score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                      {score}%
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    You answered {questions.filter((_, idx) => selectedAnswers[idx] === questions[idx].correctAnswer).length} out of {questions.length} questions correctly
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Topic: {topic}
                  </p>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{question.question}</h4>
                          <Badge 
                            variant={selectedAnswers[index] === question.correctAnswer ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {selectedAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Your answer: </span>
                            <span className={selectedAnswers[index] === question.correctAnswer ? 'text-green-400' : 'text-red-400'}>
                              {selectedAnswers[index] || 'No answer'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-400">{question.correctAnswer}</span>
                          </div>
                          <div className="text-muted-foreground">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center space-x-4 mt-6">
                  <Button onClick={resetAssessment} variant="outline" data-testid="button-new-assessment">
                    <i className="fas fa-redo mr-2"></i>
                    New Assessment
                  </Button>
                  <Link href={`/practice/${role!.id}`}>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/80" data-testid="button-practice-mode">
                      <i className="fas fa-play mr-2"></i>
                      Practice Mode
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
