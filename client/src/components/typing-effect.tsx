import { useState, useEffect } from 'react';

interface TypingEffectProps {
  messages: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypingEffect({ 
  messages, 
  speed = 100, 
  deleteSpeed = 50, 
  pauseDuration = 2000,
  className = ''
}: TypingEffectProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(currentMessage.substring(0, currentText.length - 1));
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }
      } else {
        setCurrentText(currentMessage.substring(0, currentText.length + 1));
        if (currentText.length === currentMessage.length) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentMessageIndex, isDeleting, messages, speed, deleteSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      <span className="typing-cursor"></span>
    </span>
  );
}
