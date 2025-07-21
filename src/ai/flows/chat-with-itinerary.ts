
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
  prompt: `You are a helpful and expert travel assistant. Your goal is to answer any question the user has about their trip, providing valuable and actionable advice.

The user's current itinerary is provided below in JSON format. Use it as the primary context for your answers.

Your instructions are:
1.  **Be Helpful First:** Your main goal is to be helpful. Use your extensive general knowledge about travel, destinations, transportation, food, customs, etc., to answer the user's questions.
2.  **Stay in Context:** Frame all your answers in the context of the user's specific trip. For example, if they ask for "the best pizza," you should recommend pizzerias in their travel destination.
3.  **Use the Itinerary:** Refer to the provided itinerary to understand the user's plan, schedule, and preferences. If the user asks about free time, use the itinerary to identify gaps.
4.  **No Blocking:** DO NOT refuse to answer questions just because the information isn't explicitly in the itinerary JSON. If the question is about the travel destination, you must answer it.
5.  **Decline Only When Necessary:** Only if a question is completely unrelated to travel or the destination (e.g., "Who is the president?", "What is the meaning of life?"), you can politely state that you are a travel assistant and can only help with their trip.

Itinerary Context:
{{{itineraryJson}}}

Now, answer the following user question:
"{{userQuery}}"
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
    
    // Il messaggio dell'utente è già nel prompt, quindi la cronologia è tutto ciò di cui abbiamo bisogno
    // per dare contesto alla conversazione.
    const { output } = await chatPrompt({
      itineraryJson: input.itineraryJson,
      userQuery: input.userQuery,
    }, { history });

    return output!;
  }
);
