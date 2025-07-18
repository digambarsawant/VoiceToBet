import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Rabbit, Turtle } from "lucide-react";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export function AudioControls() {
  const [volume, setVolume] = useState([75]);
  const [speed, setSpeed] = useState([1]);
  const { speak, setVolume: setTTSVolume, setRate: setTTSRate } = useTextToSpeech();

  useEffect(() => {
    setTTSVolume(volume[0] / 100);
  }, [volume, setTTSVolume]);

  useEffect(() => {
    setTTSRate(speed[0]);
  }, [speed, setTTSRate]);

  const handleTestAudio = () => {
    speak("This is a test of the audio settings. Volume and speed are working correctly.");
  };

  const getSpeedLabel = (speedValue: number) => {
    if (speedValue < 0.8) return "Slow";
    if (speedValue > 1.2) return "Fast";
    return "Normal";
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="mr-2" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Volume Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-gray-700">Volume Level</label>
              <span className="text-gray-600">{volume[0]}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <VolumeX className="h-4 w-4 text-gray-500" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                min={0}
                step={1}
                className="flex-1"
                aria-label="Audio volume from 0 to 100 percent"
              />
              <Volume2 className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Speech Rate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-gray-700">Speech Speed</label>
              <span className="text-gray-600">{getSpeedLabel(speed[0])}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Turtle className="h-4 w-4 text-gray-500" />
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={2}
                min={0.5}
                step={0.1}
                className="flex-1"
                aria-label="Speech speed from slow to fast"
              />
              <Rabbit className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Audio Test */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={handleTestAudio}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 text-lg"
            aria-label="Test audio settings"
          >
            <Play className="mr-2 h-5 w-5" />
            Test Audio
          </Button>
          <span className="ml-4 text-gray-600">Test current audio settings</span>
        </div>
      </CardContent>
    </Card>
  );
}
