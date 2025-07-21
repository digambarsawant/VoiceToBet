import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import type { Bet } from "@shared/schema";
import { useBetContext } from "./bet-context";
import { useEffect } from "react";

export function BettingSlip() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useTextToSpeech();
  const { setPlaceBetHandler } = useBetContext();

  const { data: bets = [], isLoading } = useQuery<Bet[]>({
    queryKey: ["/api/bets"],
  });


  const pendingBets = (bets as Bet[]).filter((bet: Bet) => bet.status === "pending");
  const totalStake = pendingBets.reduce((sum: number, bet: Bet) => sum + parseFloat(bet.stake), 0);
  const totalReturns = pendingBets.reduce((sum: number, bet: Bet) => sum + parseFloat(bet.potentialWin), 0);

  const deleteBetMutation = useMutation({
    mutationFn: async (betId: number) => {
      await apiRequest("DELETE", `/api/bets/${betId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      speak("Bet removed from slip");
      toast({
        title: "Bet Removed",
        description: "The bet has been removed from your slip",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove bet",
        variant: "destructive",
      });
    },
  });

  const placeBetsMutation = useMutation({
    mutationFn: async () => {
      // Update all pending bets to "placed" status
      const promises = bets
        .filter((bet: Bet) => bet.status === "pending")
        .map((bet: Bet) => 
          apiRequest("PATCH", `/api/bets/${bet.id}/status`, { status: "placed" })
        );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      const confirmation = `All bets placed successfully. Total stake: £${totalStake}. Potential returns: £${totalReturns}.`;
      speak(confirmation);
      toast({
        title: "Bets Placed",
        description: confirmation,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place bets",
        variant: "destructive",
      });
    },
  });

  const handleRemoveBet = (betId: number, selection: string) => {
    deleteBetMutation.mutate(betId);
  };

  const handlePlaceBets = () => {
    if (pendingBets.length === 0) {
      toast({
        title: "No Bets",
        description: "Add some bets to your slip first",
      });
      return;
    }
    placeBetsMutation.mutate();
  };

  useEffect(() => {
    setPlaceBetHandler(handlePlaceBets);
  }, [handlePlaceBets, setPlaceBetHandler]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="mr-2" />
            Current Betting Slip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
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
          <Ticket className="mr-2" />
          Current Betting Slip
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingBets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Ticket className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No bets in your slip</p>
            <p className="text-sm">Use voice commands to add bets</p>
          </div>
        ) : (
          <>
            {/* Bet Items */}
            <div className="space-y-4 mb-6">
              {pendingBets.map((bet: Bet) => (
                <div
                  key={bet.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary"
                  tabIndex={0}
                  role="article"
                  aria-label={`Bet on ${bet.selection}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{bet.selection}</h3>
                      <p className="text-gray-600">{bet.match}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveBet(bet.id, bet.selection)}
                      disabled={deleteBetMutation.isPending}
                      aria-label={`Remove bet on ${bet.selection}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Stake: £{parseFloat(bet.stake).toFixed(2)}</span>
                    <span className="font-medium">Odds: {parseFloat(bet.odds).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-green-600 font-semibold">
                      Potential Win: £{parseFloat(bet.potentialWin).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Betting Slip Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-lg mb-2">
                <span className="font-medium">Total Stake:</span>
                <span className="font-bold">£{totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg mb-4">
                <span className="font-medium">Potential Returns:</span>
                <span className="font-bold text-green-600">£{totalReturns.toFixed(2)}</span>
              </div>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 text-lg"
                onClick={handlePlaceBets}
                disabled={placeBetsMutation.isPending || pendingBets.length === 0}
              >
                <Check className="mr-2 h-5 w-5" />
                {placeBetsMutation.isPending ? "Placing Bets..." : "Place Bet"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
