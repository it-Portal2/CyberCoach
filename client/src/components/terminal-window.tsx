import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalWindow({ title = "ai-cyber-mentor.exe", children, className }: TerminalWindowProps) {
  return (
    <div className={cn("terminal-window rounded-lg", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="ml-4 text-sm text-muted-foreground terminal-text">{title}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          <i className="fas fa-terminal mr-1"></i>
          SECURE SHELL
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

interface TerminalPromptProps {
  user?: string;
  host?: string;
  path?: string;
  children?: ReactNode;
}

export function TerminalPrompt({ 
  user = "mentor", 
  host = "cyberlab", 
  path = "~",
  children 
}: TerminalPromptProps) {
  return (
    <div className="terminal-text text-accent text-sm flex items-center">
      <span className="text-primary">{user}@{host}:{path}$</span>
      <span className="ml-2">{children}</span>
    </div>
  );
}
