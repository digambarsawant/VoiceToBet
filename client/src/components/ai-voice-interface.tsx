import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useWhisperRecognition } from "../hooks/use-whisper-recognition";
import { useTextToSpeech } from "../hooks/use-text-to-speech";
import { useToast } from "../hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function AIVoiceInterface() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTextToSpeech();
  const {
    isListening,
    isProcessing,
    transcript,
    validation,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useWhisperRecognition();

  const [pendingBet, setPendingBet] = useState<any>(null);

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const confirmBet = async () => {
    if (!validation || !validation.extractedData) return;

    try {
      // Create the bet if it requires confirmation
      const betData = {
        selection: validation.extractedData.selection || '',
        match: validation.extractedData.match || '',
        stake: validation.extractedData.amount?.toString() || '0',
        odds: validation.extractedData.odds?.toString() || '1.0',
        potentialWin: validation.extractedData.amount && validation.extractedData.odds 
          ? (validation.extractedData.amount * validation.extractedData.odds).toString()
          : '0',
        status: 'pending'
      };

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      if (response.ok) {
        const bet = await response.json();
        speak(`Bet confirmed: £${bet.stake} on ${bet.selection}. Potential win £${bet.potentialWin}`);
        toast({
          title: "Bet Placed Successfully",
          description: `£${bet.stake} on ${bet.selection}`,
        });
        
        // Refresh bets list
        queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
        setPendingBet(null);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      speak('Failed to place bet. Please try again.');
      toast({
        title: "Error",
        description: "Failed to place bet",
        variant: "destructive",
      });
    }
  };

  const cancelBet = () => {
    setPendingBet(null);
    speak('Bet cancelled');
  };

  // Handle validation results
  if (validation && !pendingBet) {
    if (validation.isValid) {
      if (validation.requiresConfirmation) {
        setPendingBet(validation);
        speak(`Please confirm: ${validation.message}`);
      } else {
        // Bet was already placed automatically
        speak(validation.message);
        toast({
          title: "Bet Placed",
          description: validation.message,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      }
    } else {
      speak(validation.message);
      if (validation.extractedData?.action === 'unknown') {
        // Get clarification for unclear commands
        toast({
          title: "Command Not Understood",
          description: validation.message,
          variant: "destructive",
        });
      }
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Voice Interface
          </CardTitle>
          <CardDescription>
            Audio recording not supported in this browser. Please use Chrome or Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Voice Assistant
          </CardTitle>
          <CardDescription>
            Powered by OpenAI Whisper and GPT-4. Speak naturally to place bets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleVoiceCommand}
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="h-24 w-24 rounded-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>

            <div className="text-center">
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  Listening...
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="secondary">
                  AI Processing...
                </Badge>
              )}
              {!isListening && !isProcessing && (
                <Badge variant="outline">
                  Ready - Click to speak
                </Badge>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {transcript && (
            <div className="space-y-2">
              <h4 className="font-medium">What you said:</h4>
              <p className="text-sm bg-gray-100 p-3 rounded italic">"{transcript}"</p>
            </div>
          )}

          {validation && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                AI Analysis:
                {validation.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </h4>
              <div className="text-sm bg-blue-50 p-3 rounded">
                <p><strong>Confidence:</strong> {Math.round((validation.confidence || 0) * 100)}%</p>
                <p><strong>Action:</strong> {validation.extractedData?.action || 'unknown'}</p>
                {validation.extractedData?.amount && (
                  <p><strong>Amount:</strong> £{validation.extractedData.amount}</p>
                )}
                {validation.extractedData?.selection && (
                  <p><strong>Selection:</strong> {validation.extractedData.selection}</p>
                )}
                {validation.extractedData?.odds && (
                  <p><strong>Odds:</strong> {validation.extractedData.odds}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {pendingBet && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Confirm Your Bet</CardTitle>
            <CardDescription className="text-orange-700">
              Please confirm this bet before it's placed:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <p><strong>Amount:</strong> £{pendingBet.extractedData.amount}</p>
              <p><strong>Selection:</strong> {pendingBet.extractedData.selection}</p>
              <p><strong>Match:</strong> {pendingBet.extractedData.match}</p>
              <p><strong>Odds:</strong> {pendingBet.extractedData.odds}</p>
              <p><strong>Potential Win:</strong> £{(pendingBet.extractedData.amount * pendingBet.extractedData.odds).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmBet} className="bg-green-600 hover:bg-green-700">
                Confirm Bet
              </Button>
              <Button onClick={cancelBet} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Voice Commands</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• "Bet 10 pounds on Djokovic to win"</li>
            <li>• "Place 25 on Arsenal"</li>
            <li>• "Show me current odds"</li>
            <li>• "Cancel my last bet"</li>
          </ul>
          <p className="mt-3 text-xs">
            The AI will analyze your command and ask for confirmation on large bets or unclear requests.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}