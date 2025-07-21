import { VoiceInterface } from "@/components/voice-interface";
import { BettingSlip } from "@/components/betting-slip";
import { OddsDisplay } from "@/components/odds-display";
// import { AudioControls } from "@/components/audio-controls";
// import { SystemStatus } from "@/components/system-status";
import { Volume2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import EntainLogo from "../components/assets/Entain_logo.png";

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
    <div className="min-h-screen">

      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-200"  style={{background: "var(--entain-theme-background)"}} role="banner">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white flex items-center">
              <img
                src={EntainLogo}
                alt="Entain Logo"
                className="h-8 w-[8rem] mr-2"
                style={{ objectFit: "contain" }}
              />
              {/* <Volume2 className="text-primary mr-2" aria-hidden="true" /> */}
               &nbsp;|&nbsp;&nbsp; Wager Wave
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-white text-xl hover:text-primary"
                aria-label="Help and instructions"
                onClick={() => toast({
                  title: "Voice Commands Help",
                  description:(
                    <ul className="font-semibold text-gray-600 hover:text-primary text-base">
                      <li>Say commands like below for bet selection:</li>
                      <li> </li>
                      <li>Bet 10 pounds on Nadal to win 3-0</li>
                      <li>Place a bet 25 pounds on Arsenal to win 3-1</li>
                      <li>Put a bet of 2.5 pounds on Novak to win</li>
                      <li> </li>
                      <li>Say commands like below for bet placement and cancel confirmmation:</li>
                      <li> </li>
                      <li>yes</li>
                      <li>Cancel last bet</li>
                    </ul>
                  ),
                })}
              >
                help <HelpCircle className="h-5 w-5" /> 
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-6" role="main">
        {/* Voice Command Interface */}
        <VoiceInterface />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Betting Slip */}
          <BettingSlip />

          {/* Live Odds Display */}
          <OddsDisplay />
        </div>

        {/* Audio Feedback Controls */}
        {/* <AudioControls /> */}

        {/* System Status */}
        {/* <SystemStatus /> */}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg">&copy; 2025 Wager Wave Voice Betting Terminal</p>
              <p className="text-gray-400">Responsible gambling. 18 years+ only.</p>
            </div>
            <div className="flex space-x-4">
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white p-2"
                aria-label="Support"
              >
                <Volume2 className="h-5 w-5" />
              </Button> */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white p-2"
                aria-label="Accessibility information"
              >
                 Need help<HelpCircle className="h-5 w-5" /> Contact the <span className="font-semibold">Wager Wave</span> team.
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
