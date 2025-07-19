import { VoiceInterface } from "@/components/voice-interface";
import { AIVoiceInterface } from "@/components/ai-voice-interface";
import { BettingSlip } from "@/components/betting-slip";
import { OddsDisplay } from "@/components/odds-display";
import { AudioControls } from "@/components/audio-controls";
import { SystemStatus } from "@/components/system-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function BettingTerminal() {
  const { toast } = useToast();

  useEffect(() => {
    // Announce page load for screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = "Voice Betting Terminal loaded. Press the microphone button or use Alt+V to start voice command.";
    document.body.appendChild(announcement);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "h") {
        e.preventDefault();
        toast({
          title: "Help",
          description: "Press Alt+V to start voice command. Say commands like: 'Bet 10 pounds on Djokovic to win'",
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const announcements = document.querySelectorAll("[aria-live]");
      announcements.forEach(el => el.remove());
    };
  }, [toast]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-200" role="banner">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Volume2 className="text-primary mr-2" aria-hidden="true" />
              Voice Betting Terminal
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-primary"
                aria-label="Audio settings"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-primary"
                aria-label="Help and instructions"
                onClick={() => toast({
                  title: "Voice Commands Help",
                  description: "Say commands like: 'Bet 10 pounds on Djokovic to win 3-0' or 'Show me current odds'",
                })}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-6" role="main">
        {/* Voice Command Interface with AI Options */}
        <Tabs defaultValue="ai-voice" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-voice">AI Voice (Whisper + GPT)</TabsTrigger>
            <TabsTrigger value="browser-voice">Browser Voice</TabsTrigger>
          </TabsList>
          <TabsContent value="ai-voice">
            <AIVoiceInterface />
          </TabsContent>
          <TabsContent value="browser-voice">
            <VoiceInterface />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Betting Slip */}
          <BettingSlip />

          {/* Live Odds Display */}
          <OddsDisplay />
        </div>

        {/* Audio Feedback Controls */}
        <AudioControls />

        {/* System Status */}
        <SystemStatus />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg">&copy; 2024 Voice Betting Terminal</p>
              <p className="text-gray-400">Responsible gambling. 18+ only.</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white p-2"
                aria-label="Support"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white p-2"
                aria-label="Accessibility information"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
