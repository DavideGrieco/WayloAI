'use server';

/**
 * @fileOverview Itinerary generation flow using Genkit.
 *
 * - generateItinerary - A function that generates a personalized travel itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItineraryInputSchema = z.object({
  destination: z.string().describe('The destination city for the trip.'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the trip (YYYY-MM-DD).'),
  interests: z.string().describe('Comma-separated list of interests (e.g., culture, nature, gastronomy).'),
  budget: z.string().describe('The budget range for the trip (e.g., $500-$1000).'),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A JSON formatted itinerary with day-by-day activities, time slots, and descriptions.'),
  accommodationSuggestions: z.string().describe('Recommended areas to stay in, compatible with user preferences.'),
  costEstimates: z.string().describe('Detailed cost estimates divided into accommodation, transport, meals and activities.'),
  weatherForecast: z.string().describe('Essential weather forecasts for the trip duration, and alternative activities in case of bad weather'),
});

export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const itineraryPrompt = ai.definePrompt({
  name: 'itineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `You are an AI travel assistant named Waylo. Your goal is to generate a personalized day-by-day itinerary for the user based on their destination, dates, interests, and budget.

  Destination: {{destination}}
  Start Date: {{startDate}}
  End Date: {{endDate}}
  Interests: {{interests}}
  Budget: {{budget}}

  Instructions:
  1.  Generate a day-by-day itinerary with activities divided by time slots (morning, lunch, afternoon, evening).
  2.  Provide suggestions on what to do, recommended times, and the duration of each activity.
  3.  Optimize the itinerary geographically to avoid unnecessary travel.
  4.  Recommend areas to stay in, compatible with the user's preferences.
  5.  Provide essential weather forecasts and alternative activities in case of bad weather.
  6.  Provide a detailed cost estimate divided into accommodation, transport, meals, and activities.

  Output Requirements:
  -   The itinerary must be realistic, credible, and suitable for a real travel guide.
  -   The itinerary should be structured in JSON format for easy integration into a user interface.
  -   The tone should be practical, clear, and friendly.
  -   Assume the persona of a "trip in the pocket".

  Example Output:
  {
    "itinerary": [
      {
        "day": "Day 1",
        "morning": "Visit the Sagrada Familia",
        "lunch": "Have tapas at Ciudad Condal",
        "afternoon": "Stroll through Park Güell",
        "evening": "Enjoy a Flamenco show in the Gothic Quarter"
      },
      {
        "day": "Day 2",
        "morning": "Explore the Gothic Quarter",
        "lunch": "Paella near Barceloneta Beach",
        "afternoon": "Relax at Barceloneta Beach",
        "evening": "Dinner at a rooftop restaurant"
      }
    ],
    "accommodationSuggestions": "Gothic Quarter, Eixample",
    "costEstimates": {
      "accommodation": "$100-$200/night",
      "transport": "$20/day",
      "meals": "$50/day",
      "activities": "$30/day"
    },
    "weatherForecast": "Sunny, 25°C. In case of rain, visit museums like the Picasso Museum."
  }

  Return the output in JSON format.
  `, // Multiline string for better readability
});

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async input => {
    const {output} = await itineraryPrompt(input);
    return output!;
  }
);
