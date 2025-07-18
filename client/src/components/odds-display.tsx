import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import type { Match, BetOption } from "@shared/schema";

export function OddsDisplay() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTextToSpeech();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/matches"],
  });

  const createBetMutation = useMutation({
    mutationFn: async (betData: {
      selection: string;
      match: string;
      odds: number;
      stake: number;
    }) => {
      const response = await apiRequest("POST", "/api/bets", {
        selection: betData.selection,
        match: betData.match,
        stake: betData.stake.toString(),
        odds: betData.odds.toString(),
        potentialWin: (betData.stake * betData.odds).toFixed(2),
        status: "pending",
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      const confirmation = `Bet added to slip: £${data.stake} on ${data.selection} at odds ${data.odds}`;
      speak(confirmation);
      toast({
        title: "Bet Added",
        description: confirmation,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bet to slip",
        variant: "destructive",
      });
    },
  });

  const handleQuickBet = (selection: string, match: string, odds: number) => {
    // Default stake of £10 for quick bets
    createBetMutation.mutate({
      selection,
      match,
      odds,
      stake: 10,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2" />
            Live Odds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2" />
          Live Odds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match: Match) => (
            <div
              key={match.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary"
              tabIndex={0}
              role="article"
              aria-label={`${match.title} match odds`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{match.title}</h3>
                  <p className="text-gray-600">{match.matchTime}</p>
                </div>
                {match.isLive && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                    LIVE
                  </span>
                )}
              </div>
              
              {/* Player/Team Odds */}
              <div className="space-y-2 mb-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 bg-gray-50 hover:bg-gray-100 h-auto"
                  onClick={() => handleQuickBet(match.player1, match.title, parseFloat(match.player1Odds))}
                  disabled={createBetMutation.isPending}
                  aria-label={`Bet on ${match.player1} at odds ${match.player1Odds}`}
                >
                  <span className="font-medium">{match.player1}</span>
                  <span className="font-bold text-lg">{match.player1Odds}</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 bg-gray-50 hover:bg-gray-100 h-auto"
                  onClick={() => handleQuickBet(match.player2, match.title, parseFloat(match.player2Odds))}
                  disabled={createBetMutation.isPending}
                  aria-label={`Bet on ${match.player2} at odds ${match.player2Odds}`}
                >
                  <span className="font-medium">{match.player2}</span>
                  <span className="font-bold text-lg">{match.player2Odds}</span>
                </Button>
              </div>

              {/* Special Betting Options for Tennis */}
              {match.sport === "Tennis" && (
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Set Score</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      className="p-2 text-sm bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Djokovic 3-0", match.title, 3.50)}
                      disabled={createBetMutation.isPending}
                      aria-label="Djokovic 3-0 at odds 3.50"
                    >
                      <span className="font-medium">Djokovic 3-0</span>
                      <span className="text-primary font-bold">3.50</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 text-sm bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Djokovic 3-1", match.title, 4.20)}
                      disabled={createBetMutation.isPending}
                      aria-label="Djokovic 3-1 at odds 4.20"
                    >
                      <span className="font-medium">Djokovic 3-1</span>
                      <span className="text-primary font-bold">4.20</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 text-sm bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Nadal 3-1", match.title, 5.80)}
                      disabled={createBetMutation.isPending}
                      aria-label="Nadal 3-1 at odds 5.80"
                    >
                      <span className="font-medium">Nadal 3-1</span>
                      <span className="text-primary font-bold">5.80</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-2 text-sm bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Nadal 3-0", match.title, 6.50)}
                      disabled={createBetMutation.isPending}
                      aria-label="Nadal 3-0 at odds 6.50"
                    >
                      <span className="font-medium">Nadal 3-0</span>
                      <span className="text-primary font-bold">6.50</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Football 1X2 Betting */}
              {match.sport === "Football" && (
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Match Result</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="ghost"
                      className="p-3 bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Arsenal Win", match.title, 2.40)}
                      disabled={createBetMutation.isPending}
                      aria-label="Arsenal to win at odds 2.40"
                    >
                      <span className="font-medium text-sm">Arsenal</span>
                      <span className="text-primary font-bold">2.40</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-3 bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Draw", match.title, 3.20)}
                      disabled={createBetMutation.isPending}
                      aria-label="Draw at odds 3.20"
                    >
                      <span className="font-medium text-sm">Draw</span>
                      <span className="text-primary font-bold">3.20</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="p-3 bg-gray-50 hover:bg-gray-100 h-auto flex-col"
                      onClick={() => handleQuickBet("Man City Win", match.title, 3.10)}
                      disabled={createBetMutation.isPending}
                      aria-label="Manchester City to win at odds 3.10"
                    >
                      <span className="font-medium text-sm">Man City</span>
                      <span className="text-primary font-bold">3.10</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
