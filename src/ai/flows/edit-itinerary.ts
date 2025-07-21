
'use server';

/**
 * @fileOverview Flow for editing an existing travel itinerary using Genkit.
 *
 * - editItinerary - A function that takes an existing itinerary and a user request to modify it.
 * - EditItineraryInput - The input type for the editItinerary function.
 * - EditItineraryOutput - The return type for the editItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GenerateItineraryOutput } from './generate-itinerary';

// Define schemas locally to avoid importing Zod objects from another "use server" file.

const ActivitySchema = z.object({
  time: z.string(),
  type: z.enum(['activity', 'food', 'transport']),
  description: z.string(),
  details: z.string(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const AccommodationSuggestionSchema = z.object({
    name: z.string(),
    zone: z.string(),
    description: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
});

const ItineraryDaySchema = z.object({
    day: z.string(),
    activities: z.array(ActivitySchema),
});

const CostEstimatesSchema = z.object({
    accommodation: z.string(),
    transport: z.string(),
    meals: z.string(),
    activities: z.string(),
});

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(ItineraryDaySchema),
  accommodationSuggestions: z.array(AccommodationSuggestionSchema),
  potentialIssues: z.string(),
  costEstimates: CostEstimatesSchema,
  weatherForecast: z.string(),
  localEvents: z.string(),
});

const GenerateItineraryInputSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.string(),
  budget: z.string(),
  travelerType: z.string(),
  travelPace: z.string(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  hotelName: z.string().optional(),
});

// Updated Schema to accept a stringified itinerary
const EditItineraryInputSchema = z.object({
    existingItineraryJson: z.string().describe("The existing JSON travel itinerary as a string."),
    editRequest: z.string().describe("The user's specific request to modify the itinerary (e.g., 'Add a shopping activity on day 2', 'Make the pace of the first day more relaxed')."),
    originalInput: GenerateItineraryInputSchema.optional().describe("The original input data used to create the itinerary, to maintain context.")
});

export type EditItineraryInput = {
    existingItinerary: GenerateItineraryOutput,
    editRequest: string,
    originalInput?: z.infer<typeof GenerateItineraryInputSchema>
};
export type EditItineraryOutput = GenerateItineraryOutput;

export async function editItinerary(input: EditItineraryInput): Promise<EditItineraryOutput> {
  const promptInput = {
      existingItineraryJson: JSON.stringify(input.existingItinerary),
      editRequest: input.editRequest,
      originalInput: input.originalInput,
  };
  return editItineraryFlow(promptInput);
}

const editItineraryPrompt = ai.definePrompt({
  name: 'editItineraryPrompt',
  input: { schema: EditItineraryInputSchema },
  output: { schema: GenerateItineraryOutputSchema },
  prompt: `You are an AI travel assistant named Waylo. Your task is to modify an existing travel itinerary based on a user's request.

Original Data (if available):
- Destination: {{originalInput.destination}}
- Dates: {{originalInput.startDate}} to {{originalInput.endDate}}
- Interests: {{originalInput.interests}}
- Budget: {{originalInput.budget}}
- Traveler Type: {{originalInput.travelerType}}
- Pace: {{originalInput.travelPace}}

Existing Itinerary (in JSON format):
{{{existingItineraryJson}}}

User's Edit Request:
"{{editRequest}}"

Mandatory Instructions:
1.  Analyze the user's request and apply the necessary changes to the existing itinerary. DO NOT regenerate the itinerary from scratch.
2.  Maintain the same JSON structure as the original itinerary.
3.  Ensure that place names remain REAL and geographic coordinates ACCURATE.
4.  The output must be ONLY in valid JSON format, representing the entire updated itinerary object. Do not include any text or comments outside the JSON.
5.  If the request is unclear or impossible to fulfill, modify the 'potentialIssues' field to explain it politely.
`,
});

const editItineraryFlow = ai.defineFlow(
  {
    name: 'editItineraryFlow',
    inputSchema: EditItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async (promptInput) => {
    const { output } = await editItineraryPrompt(promptInput);
    // The AI output is already a JSON object due to the output schema.
    // We should not parse it again here, as it can confuse the Next.js bundler.
    // If the AI sometimes returns a string, that parsing should be handled
    // carefully in the calling client component, not in the server flow.
    return output!;
  }
);
