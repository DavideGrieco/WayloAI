
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

const EditItineraryInputSchema = z.object({
    existingItinerary: GenerateItineraryOutputSchema.describe("The existing JSON travel itinerary that needs to be modified."),
    editRequest: z.string().describe("The user's specific request to modify the itinerary (e.g., 'Add a shopping activity on day 2', 'Make the pace of the first day more relaxed')."),
    originalInput: GenerateItineraryInputSchema.optional().describe("The original input data used to create the itinerary, to maintain context.")
});

export type EditItineraryInput = z.infer<typeof EditItineraryInputSchema>;
export type EditItineraryOutput = GenerateItineraryOutput;

export async function editItinerary(input: EditItineraryInput): Promise<EditItineraryOutput> {
  return editItineraryFlow(input);
}

const editItineraryPrompt = ai.definePrompt({
  name: 'editItineraryPrompt',
  input: {schema: EditItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `You are an AI travel assistant named Waylo. Your task is to modify an existing travel itinerary based on a user's request.

Original Data (if available):
- Destination: {{originalInput.destination}}
- Dates: {{originalInput.startDate}} to {{originalInput.endDate}}
- Interests: {{originalInput.interests}}
- Budget: {{originalInput.budget}}
- Traveler Type: {{originalInput.travelerType}}
- Pace: {{originalInput.travelPace}}

Existing Itinerary (in JSON format):
{{{jsonStringify existingItinerary}}}

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
  async (input) => {
    // The prompt needs the itinerary as a string, so we add a helper to stringify it.
    const augmentedInput = { ...input, jsonStringify: JSON.stringify };
    const {output} = await editItineraryPrompt(augmentedInput);
    
    if (typeof output === 'string') {
        try {
            return JSON.parse(output) as EditItineraryOutput;
        } catch (e) {
            console.error("Failed to parse stringified JSON from AI for edit, returning raw output.", e);
        }
    }
    
    return output!;
  }
);
