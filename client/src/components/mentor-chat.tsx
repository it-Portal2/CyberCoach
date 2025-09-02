import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mentorAI } from '@/lib/mentor-ai';
import { storage } from '@/lib/storage';
import { MentorResponse } from '@shared/schema';
import jitBanerjeeImage from '@/assets/jit-banerjee.jpg';

interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  content: string;
  timestamp: Date;
  response?: MentorResponse;
}

interface MentorChatProps {
  jobRole?: string;
  className?: string;
}

export function MentorChat({ jobRole, className }: MentorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'mentor',
      content: "Hello! I'm Jit Banerjee, your cybersecurity mentor with 6+ years of field experience. My AI version is here to guide you 24/7 with penetration testing, red teaming, SOC operations, and career guidance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const mentorResponse = await mentorAI.askMentor({
        message: inputMessage,
        jobRole,
        context: `Chat conversation in ${jobRole || 'general'} context`
      });

      const mentorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'mentor',
        content: mentorResponse.response,
        timestamp: new Date(),
        response: mentorResponse
      };

      setMessages(prev => [...prev, mentorMessage]);
      
      // Save to storage
      storage.saveChatMessage(userMessage);
      storage.saveChatMessage(mentorMessage);

      // Track activity
      storage.addActivity({
        type: 'chat',
        title: `Chat: Mentor Consultation`,
        description: 'Asked question and received guidance from AI mentor',
        role: 'General',
        xp: 15
      });

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from mentor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`glow-border bg-gradient-to-r from-card to-primary/5 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="flex items-center">
            <img 
              src={jitBanerjeeImage} 
              alt="Jit Banerjee" 
              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-primary"
            />
            <div>
              <div className="flex items-center">
                <span className="text-lg">Jit Banerjee AI Mentor</span>
                {jobRole && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {jobRole}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-normal">Cybersecurity Expert • 6+ Years Experience</div>
            </div>
          </div>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Get instant guidance from Jit Banerjee's AI mentor - available 24/7 for all your cybersecurity questions
        </p>
      </CardHeader>
      <CardContent>
        <div className="terminal-window rounded-lg mb-6">
          <ScrollArea className="h-64 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  {message.role === 'mentor' ? (
                    <img 
                      src={jitBanerjeeImage} 
                      alt="Jit Banerjee" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1 text-primary">
                      {message.role === 'mentor' ? 'Jit Banerjee AI Mentor' : 'You'}
                    </div>
                    <div className={`rounded-lg p-3 text-sm ${
                      message.role === 'mentor' ? 'bg-primary/10' : 'bg-secondary/50'
                    }`}>
                      {message.content}
                      
                      {message.response && (
                        <div className="mt-3 space-y-2">
                          {message.response.methodology && message.response.methodology.length > 0 && (
                            <div>
                              <div className="text-xs text-accent font-semibold mb-1">Methodology:</div>
                              <ol className="list-decimal list-inside text-xs space-y-1">
                                {message.response.methodology.map((step, idx) => (
                                  <li key={idx} className="text-muted-foreground">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          
                          {message.response.hints && message.response.hints.length > 0 && (
                            <div>
                              <div className="text-xs text-yellow-400 font-semibold mb-1">Hints:</div>
                              <ul className="list-disc list-inside text-xs space-y-1">
                                {message.response.hints.map((hint, idx) => (
                                  <li key={idx} className="text-muted-foreground">{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
{/* 
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                            <Badge variant="outline" className="text-xs">
                              Confidence: {message.response.confidence}
                            </Badge>
                            {message.response.kpis && message.response.kpis.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                KPIs: {message.response.kpis.join(', ')}
                              </div>
                            )}
                          </div> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <img 
                    src={jitBanerjeeImage} 
                    alt="Jit Banerjee" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-primary font-semibold mb-1">Jit Banerjee AI Mentor</div>
                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span>Analyzing your question...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex space-x-4">
          <Input
            type="text"
            placeholder="Ask about methodology, career advice, or specific techniques..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-input border-border focus:ring-primary focus:border-primary"
            data-testid="input-mentor-chat"
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/80"
            data-testid="button-send-message"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
