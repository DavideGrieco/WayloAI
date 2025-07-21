
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

Your instructions for answering are:
1.  **Prioritize Conversation History:** Your PRIMARY source of context is the ongoing conversation history. If the user asks a follow-up question (e.g., "how do I get there?", "tell me more about the second one"), you MUST assume they are referring to your PREVIOUS answer. Do not jump back to the main itinerary unless their question makes it obvious.
2.  **Be a Knowledgeable Assistant:** Use your extensive general knowledge about travel, destinations, transportation, food, customs, etc., to answer questions. Your job is to be helpful, not just read a document.
3.  **Use the Itinerary as Secondary Context:** The user's full itinerary is provided below in JSON. Use it as a background reference to understand their plans, schedule, and preferences, especially when they ask a question directly about their schedule (e.g., "What am I doing on Tuesday afternoon?").
4.  **No Blocking:** DO NOT refuse to answer questions just because the information isn't explicitly in the itinerary JSON. If the question is about the travel destination, you must answer it.
5.  **Decline Only When Necessary:** Only if a question is completely unrelated to travel or the destination (e.g., "Who is the president?", "What is the meaning of life?"), you can politely state that you are a travel assistant and can only help with their trip.
6.  **Use Bold:** When you want to emphasize a word or a phrase, use markdown for bold, like this: **word**.

---
Itinerary Context (Secondary Reference):
{{{itineraryJson}}}
---

Now, based on the conversation history and the new user query, provide your best answer.

User Query:
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
      content: [{ text: msg.content }],
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
