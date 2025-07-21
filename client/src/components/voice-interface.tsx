import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useBetContext } from "./bet-context";

export function VoiceInterface() {
  const [lastCommand, setLastCommand] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTextToSpeech();
  const { triggerPlaceBet } = useBetContext();
  const placeBetRegex = /^(yes[\s\.]*)+$/i;

  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    isSupported,
    error,
  } = useSpeechRecognition();
 
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await apiRequest("POST", "/api/voice-command", {
        command,
        confidence: 0.8,
      });
      return response.json();
    },
    onSuccess: (data) => {
      speak(data.confirmation);
      toast({
        title: "Command Processed",
        description: data.confirmation,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
    onError: (error) => {
      const errorMessage = "Sorry, I couldn't process that command. Please try again.";
      speak(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (transcript) {
      setLastCommand(transcript);
     
      if(placeBetRegex.test(transcript.toLowerCase())){
        triggerPlaceBet();
      } else {
      processCommandMutation.mutate(transcript);
      }
    }
  }, [transcript]);

  const handleVoiceButtonPress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getVoiceStatus = () => {
    if (!isSupported) return { text: "Speech recognition not supported", color: "bg-red-500" };
    if (error) return { text: `Error: ${error}`, color: "bg-red-500" };
    if (isListening) return { text: "Listening...", color: "bg-blue-500 animate-pulse" };
    if (processCommandMutation.isPending) return { text: "Processing command...", color: "bg-yellow-500" };
    return { text: "Ready to listen", color: "bg-gray-400" };
  };

  const voiceStatus = getVoiceStatus();

  return (
    <Card className="mb-6" style={{background: "var(--theme-background)"}}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2" />
          Voice Commands
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Voice Status Indicator */}
        <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
          <div className={`w-4 h-4 rounded-full mr-3 ${voiceStatus.color}`} aria-hidden="true" />
          <span className="text-lg font-medium">{voiceStatus.text}</span>
        </div>

        {/* Main Voice Button */}
        <div className="text-center mb-6">
          <Button
            className="w-32 h-32 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            onClick={handleVoiceButtonPress}
            disabled={!isSupported || processCommandMutation.isPending}
            aria-label="Press to give voice command. Say something like: Bet 10 pounds on Djokovic to win 3-0"
          >
            <Mic className="h-12 w-12" />
          </Button>
          <p className="mt-4 text-lg text-gray-700">
            {isListening ? "Listening... Speak now" : "Press to speak"}
          </p>
        </div>


        {/* Last Command Display */}
        {lastCommand && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Command:
            </label>
            <div className="text-lg font-mono bg-white p-3 rounded border">
              "{lastCommand}"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
