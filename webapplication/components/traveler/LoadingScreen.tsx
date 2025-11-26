"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingMessage {
  text: string;
  icon: string;
}

const AI_MESSAGES: LoadingMessage[] = [
  { text: "AI is analyzing your preferences...", icon: "🤔" },
  { text: "Finding the best attractions for you...", icon: "🗺️" },
  { text: "Calculating optimal routes...", icon: "🧭" },
  { text: "Optimizing your itinerary...", icon: "✨" },
  { text: "Adding final touches...", icon: "🎯" },
  { text: "Almost ready...", icon: "⏳" }
];

const MANUAL_MESSAGES: LoadingMessage[] = [
  { text: "Organizing your selected locations...", icon: "📍" },
  { text: "Calculating travel distances...", icon: "🧭" },
  { text: "Optimizing visit order...", icon: "🔄" },
  { text: "Planning daily schedule...", icon: "📅" },
  { text: "Generating route map...", icon: "🗺️" },
  { text: "Almost ready...", icon: "⏳" }
];

interface LoadingScreenProps {
  mode: 'AI' | 'MANUAL';
}

export default function LoadingScreen({ mode }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = mode === 'AI' ? AI_MESSAGES : MANUAL_MESSAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        {/* Animated Spinner */}
        <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
        
        {/* Message with Icon */}
        <div 
          key={messageIndex} 
          className="flex flex-col items-center space-y-4 animate-fade-in"
        >
          <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
            {currentMessage.icon}
          </span>
          <p className="text-xl lg:text-2xl font-bold text-gray-900 text-center max-w-md font-poppins px-4">
            {currentMessage.text}
          </p>
        </div>
      </div>
    </div>
  );
}
