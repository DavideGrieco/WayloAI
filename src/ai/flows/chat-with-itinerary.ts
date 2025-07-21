
'use server';

/**
 * @fileOverview Flow per chattare con un itinerario di viaggio usando Genkit.
 * Fornisce risposte basate sull’itinerario fornito, mantenendo il contesto della conversazione.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Definisco uno schema per un singolo messaggio
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Schema input
const ChatWithItineraryInputSchema = z.object({
  itineraryJson: z.string().describe("Itinerario di viaggio in formato JSON come stringa."),
  userQuery: z.string().describe("Domanda dell'utente sull'itinerario."),
  history: z.array(MessageSchema).optional().describe("Storico della conversazione."),
});

export type ChatWithItineraryInput = z.infer<typeof ChatWithItineraryInputSchema>;

// Schema output
const ChatWithItineraryOutputSchema = z.object({
  response: z.string().describe("Risposta dell’AI alla domanda dell’utente."),
});

export type ChatWithItineraryOutput = z.infer<typeof ChatWithItineraryOutputSchema>;

// Prompt AI
const chatPrompt = ai.definePrompt({
  name: 'chatWithItineraryPrompt',
  input: { schema: ChatWithItineraryInputSchema },
  output: { schema: ChatWithItineraryOutputSchema },
  history: z.array(MessageSchema),
  prompt: `You are a helpful and clever travel assistant. Your knowledge base is the travel itinerary provided below.
Your main goal is to answer the user's questions based on the provided itinerary.
You can make logical inferences from the itinerary data. For example, if asked about free time, you can identify gaps between scheduled activities.
If a question is truly unrelated to the trip (e.g., "What is the capital of France?"), politely state that you can only answer questions about this specific trip plan.

Itinerary Context:
{{{itineraryJson}}}

---
User's new question: "{{userQuery}}"

Your response must be concise, helpful, and directly related to the provided itinerary.
`,
});

// Funzione principale
export async function chatWithItinerary(input: ChatWithItineraryInput): Promise<ChatWithItineraryOutput> {
  return chatWithItineraryFlow(input);
}

// Flow di esecuzione
const chatWithItineraryFlow = ai.defineFlow(
  {
    name: 'chatWithItineraryFlow',
    inputSchema: ChatWithItineraryInputSchema,
    outputSchema: ChatWithItineraryOutputSchema,
  },
  async (input) => {
    // Ricostruisci la cronologia per il prompt
    const history = (input.history || []).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Prepara l'input per il prompt, che ora gestisce direttamente la cronologia
    const promptInput = {
      itineraryJson: input.itineraryJson,
      userQuery: input.userQuery,
      history,
    };
    
    const { output } = await chatPrompt(promptInput);

    return output!;
  }
);
