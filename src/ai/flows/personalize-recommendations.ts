'use server';

/**
 * @fileOverview A flow that provides personalized recommendations for activities,
 * accommodation areas, and cost estimations based on user preferences and budget.
 *
 * - personalizeRecommendations - A function that handles the personalized recommendations process.
 * - PersonalizeRecommendationsInput - The input type for the personalizeRecommendations function.
 * - PersonalizeRecommendationsOutput - The return type for the personalizeRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeRecommendationsInputSchema = z.object({
  destination: z.string().describe('The destination for the trip (e.g., Barcelona).'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the trip (YYYY-MM-DD).'),
  interests: z
    .string()
    .describe(
      'A comma-separated list of the user\'s main interests (e.g., culture, nature, gastronomy, shopping, adventure).'
    ),
  budget: z
    .string()
    .describe('The approximate budget range for the trip (e.g., $500-$1000).'),
});
export type PersonalizeRecommendationsInput = z.infer<
  typeof PersonalizeRecommendationsInputSchema
>;

const PersonalizeRecommendationsOutputSchema = z.object({
  dailyItinerary: z
    .string()
    .describe(
      'A day-by-day itinerary with activities divided by time slots (morning, lunch, afternoon, evening).'
    ),
  accommodationRecommendations: z
    .string()
    .describe(
      'Recommended areas to stay in, compatible with the user\'s preferences.'
    ),
  costEstimation: z
    .string()
    .describe(
      'A detailed cost estimation, divided into accommodation, internal transport, meals, and activities.'
    ),
  weatherForecast: z
    .string()
    .describe('Essential weather forecasts for the duration of the trip.'),
  alternativeActivities: z
    .string()
    .describe('Alternative activities in case of bad weather.'),
});

export type PersonalizeRecommendationsOutput = z.infer<
  typeof PersonalizeRecommendationsOutputSchema
>;

export async function personalizeRecommendations(
  input: PersonalizeRecommendationsInput
): Promise<PersonalizeRecommendationsOutput> {
  return personalizeRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeRecommendationsPrompt',
  input: {schema: PersonalizeRecommendationsInputSchema},
  output: {schema: PersonalizeRecommendationsOutputSchema},
  prompt: `You are an intelligent virtual travel assistant called Waylo AI.
  Your goal is to provide the user with a complete and structured personalized itinerary in seconds, ready to follow, based on the destination, dates, interests and budget provided.

  Destination: {{{destination}}}
  Start Date: {{{startDate}}}
  End Date: {{{endDate}}}
  Interests: {{{interests}}}
  Budget: {{{budget}}}

  Instructions:
  1.  Create a day-by-day itinerary with activities divided by time slots (morning, lunch, afternoon, evening).
  2.  Suggest activities with recommended times and duration.
  3.  Optimize the itinerary geographically to avoid unnecessary travel.
  4.  Recommend areas to stay in, compatible with the user's preferences.
  5.  Include essential weather forecasts for the duration of the trip, and suggest alternative activities in case of bad weather.
  6.  Provide a detailed cost estimation, divided into accommodation, internal transport, meals, and activities.

  Important:
  -   The output must be realistic, credible and suitable for a real guide.
  -   The itinerary must be structured, for example in JSON format, for easy integration into the user interface.
  -   The tone should be practical, clear, and friendly.
  - Do not provide any introductory or closing remarks.

  Output format: JSON`,
});

const personalizeRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizeRecommendationsFlow',
    inputSchema: PersonalizeRecommendationsInputSchema,
    outputSchema: PersonalizeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
