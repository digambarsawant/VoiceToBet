import OpenAI from "openai";

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    action: 'bet' | 'show_odds' | 'cancel_bet' | 'unknown';
    amount?: number;
    selection?: string;
    match?: string;
    odds?: number;
  };
  message: string;
  requiresConfirmation: boolean;
}

export interface WhisperTranscription {
  text: string;
  confidence: number;
  language?: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function transcribeAudio(audioBuffer: Buffer): Promise<WhisperTranscription> {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please provide OPENAI_API_KEY environment variable.");
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.webm", { type: "audio/webm" }),
      model: "whisper-1",
      language: "en",
      response_format: "verbose_json",
    });

    return {
      text: response.text,
      confidence: 0.9, // Whisper doesn't provide confidence, but it's generally high
      language: response.language,
    };
  } catch (error) {
    console.error("Whisper transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function validateBettingCommand(transcript: string): Promise<ValidationResult> {
  if (!openai) {
    return {
      isValid: false,
      confidence: 0,
      extractedData: { action: 'unknown' },
      message: "AI validation unavailable. Please configure OpenAI API key.",
      requiresConfirmation: false,
    };
  }

  try {
    const prompt = `
You are an AI agent for a voice-controlled betting terminal. Analyze the following voice command and extract betting information.

Voice Command: "${transcript}"

Available matches and odds:
- Wimbledon Final: Djokovic (1.75), Nadal (2.10)
- Arsenal vs Manchester City: Arsenal (2.40), Draw (3.20), Manchester City (3.10)

Respond with JSON in this exact format:
{
  "isValid": boolean,
  "confidence": number (0-1),
  "extractedData": {
    "action": "bet" | "show_odds" | "cancel_bet" | "unknown",
    "amount": number or null,
    "selection": "string or null",
    "match": "string or null", 
    "odds": number or null
  },
  "message": "Clear confirmation message",
  "requiresConfirmation": boolean
}

Rules:
1. Only mark as valid if the command is clearly a betting instruction
2. Extract exact amounts (10, 20, etc.)
3. Map player/team names to exact matches
4. Set requiresConfirmation=true for amounts over £50 or unclear commands
5. Provide helpful error messages for invalid commands
6. Use confidence score based on clarity of the command
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a precise betting command validator. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.hasOwnProperty('isValid') || !result.hasOwnProperty('extractedData')) {
      throw new Error("Invalid AI response format");
    }

    return result as ValidationResult;

  } catch (error) {
    console.error("AI validation error:", error);
    return {
      isValid: false,
      confidence: 0,
      extractedData: { action: 'unknown' },
      message: "Sorry, I couldn't understand that command. Please try again.",
      requiresConfirmation: false,
    };
  }
}

export async function generateConfirmationMessage(validationResult: ValidationResult): Promise<string> {
  if (!validationResult.isValid) {
    return validationResult.message;
  }

  const { extractedData } = validationResult;
  
  switch (extractedData.action) {
    case 'bet':
      const potential = extractedData.amount && extractedData.odds 
        ? (extractedData.amount * extractedData.odds).toFixed(2)
        : 'unknown';
      
      return `Bet confirmed: £${extractedData.amount} on ${extractedData.selection} at odds ${extractedData.odds}. Potential win: £${potential}. This bet has been placed.`;
      
    case 'show_odds':
      return "Displaying current odds for all available matches.";
      
    case 'cancel_bet':
      return "Your last bet has been cancelled successfully.";
      
    default:
      return validationResult.message;
  }
}

export async function handleUnclearCommand(transcript: string): Promise<string> {
  if (!openai) {
    return "Please try saying something like 'Bet 10 pounds on Djokovic to win'";
  }

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful betting assistant. The user said something unclear. Provide a friendly suggestion for how to place a bet correctly."
        },
        {
          role: "user",
          content: `The user said: "${transcript}". This wasn't clear enough to place a bet. Suggest how they should phrase their command.`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content || "Please try saying something like 'Bet 10 pounds on Djokovic to win'";
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return "Please try saying something like 'Bet 10 pounds on Djokovic to win'";
  }
}