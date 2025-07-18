import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, CheckCircle, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export function SystemStatus() {
  const { isSupported: speechSupported } = useSpeechRecognition();
  const { isSupported: ttsSupported } = useTextToSpeech();

  const services = [
    {
      name: "Speech Recognition",
      status: speechSupported ? "online" : "offline",
      description: speechSupported ? "Online" : "Not Supported",
    },
    {
      name: "Betting Service",
      status: "online",
      description: "Connected",
    },
    {
      name: "Audio Output",
      status: ttsSupported ? "online" : "offline",
      description: ttsSupported ? "Working" : "Not Supported",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-50 border-green-200 text-green-900";
      case "offline":
        return "bg-red-50 border-red-200 text-red-900";
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "offline":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wifi className="mr-2" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className={`flex items-center p-4 rounded-lg border ${getStatusColor(service.status)}`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${getIndicatorColor(service.status)}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{service.name}</p>
                  {getStatusIcon(service.status)}
                </div>
                <p className="text-sm opacity-80">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
