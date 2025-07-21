'use server';

/**
 * @fileOverview Flow for chatting with an existing travel itinerary using Genkit.
 *
 * - chatWithItinerary - A function that takes an itinerary and a user query to provide contextual answers.
 * - ChatWithItineraryInput - The input type for the chatWithItinerary function.
 * - ChatWithItineraryOutput - The return type for the chatWithItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithItineraryInputSchema = z.object({
  itineraryJson: z.string().describe("The existing JSON travel itinerary as a string. This is the context for the conversation."),
  userQuery: z.string().describe("The user's question about the itinerary."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe("The previous conversation history.")
});
export type ChatWithItineraryInput = z.infer<typeof ChatWithItineraryInputSchema>;

const ChatWithItineraryOutputSchema = z.object({
    response: z.string().describe('The AI\'s response to the user query.'),
});
export type ChatWithItineraryOutput = z.infer<typeof ChatWithItineraryOutputSchema>;


export async function chatWithItinerary(input: ChatWithItineraryInput): Promise<ChatWithItineraryOutput> {
  return chatWithItineraryFlow(input);
}


const chatPrompt = ai.definePrompt({
  name: 'chatWithItineraryPrompt',
  input: { schema: ChatWithItineraryInputSchema },
  output: { schema: ChatWithItineraryOutputSchema },
  prompt: `You are a helpful travel assistant. Your ONLY knowledge base is the travel itinerary provided below. You must answer the user's questions based exclusively on this itinerary. Do not use any external knowledge or make up information. If the user asks something that cannot be answered from the itinerary, politely state that you can only answer questions about this specific trip plan.

Itinerary Context:
{{{itineraryJson}}}

---
{{#if history}}
Conversation History:
{{#each history}}
{{#if (eq role 'user')}}User: {{content}}{{/if}}
{{#if (eq role 'model')}}Assistant: {{content}}{{/if}}
{{/each}}
{{/if}}

---
User's new question: "{{userQuery}}"

Your response must be concise, helpful, and directly related to the provided itinerary.
`,
});

const chatWithItineraryFlow = ai.defineFlow(
  {
    name: 'chatWithItineraryFlow',
    inputSchema: ChatWithItineraryInputSchema,
    outputSchema: ChatWithItineraryOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
