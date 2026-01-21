import React, { useState } from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface OnboardingWelcomeProps {
  studentName?: string;
  welcomeMessage?: string;
  videoUrl?: string;
  onContinue: () => void;
}

// Convert YouTube/Loom URL to embed URL
const getEmbedUrl = (url: string) => {
  if (!url) return '';

  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1`;
  }

  // Handle Loom URLs
  if (url.includes('loom.com')) {
    const loomMatch = url.match(/loom\.com\/(share|embed)\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
      return `https://www.loom.com/embed/${loomMatch[2]}`;
    }
  }

  return url;
};

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  studentName,
  welcomeMessage,
  videoUrl,
  onContinue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : '';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-700 p-8 md:p-10 text-white">
        <div className="flex items-center gap-2 text-violet-200 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Welcome to the Bootcamp</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          {studentName ? `Hey ${studentName}!` : 'Welcome!'}
        </h1>
        <p className="text-base text-violet-100 max-w-lg">
          {welcomeMessage ||
            "You're about to master LinkedIn outreach and start generating quality leads for your business. Watch the intro video below, then let's get you set up."}
        </p>
      </div>

      {/* Video Section */}
      {embedUrl && (
        <div className="relative bg-zinc-900">
          <div className="aspect-video">
            {isPlaying ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Intro Video"
              />
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                <span className="text-white font-medium">Watch Intro Video</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="p-6 md:p-8">
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          Let's Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
