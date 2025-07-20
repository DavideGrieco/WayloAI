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
  destination: z.string().describe('La città di destinazione del viaggio.'),
  startDate: z.string().describe('La data di inizio del viaggio (YYYY-MM-DD).'),
  endDate: z.string().describe('La data di fine del viaggio (YYYY-MM-DD).'),
  interests: z.string().describe('Elenco di interessi separati da virgole (es. cultura, natura, gastronomia).'),
  budget: z.string().describe('Il budget approssimativo per il viaggio (es. 500€-1000€).'),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('Un itinerario in formato JSON con attività giornaliere, fasce orarie e descrizioni.'),
  accommodationSuggestions: z.string().describe('Aree consigliate in cui soggiornare, compatibili con le preferenze dell\'utente.'),
  costEstimates: z.string().describe('Stime dettagliate dei costi suddivise in alloggio, trasporti, pasti e attività.'),
  weatherForecast: z.string().describe('Previsioni meteorologiche essenziali per la durata del viaggio e attività alternative in caso di maltempo.'),
});

export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const itineraryPrompt = ai.definePrompt({
  name: 'itineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `Sei un assistente di viaggio AI chiamato Waylo. Il tuo obiettivo è generare un itinerario personalizzato giorno per giorno per l'utente in base alla destinazione, alle date, agli interessi e al budget. La risposta DEVE essere in italiano.

  Destinazione: {{destination}}
  Data di inizio: {{startDate}}
  Data di fine: {{endDate}}
  Interessi: {{interests}}
  Budget: {{budget}}

  Istruzioni:
  1. Genera un itinerario giorno per giorno con attività suddivise per fasce orarie (mattina, pranzo, pomeriggio, sera).
  2. Fornisci suggerimenti su cosa fare, orari consigliati e durata di ogni attività.
  3. Ottimizza l'itinerario geograficamente per evitare spostamenti inutili.
  4. Raccomanda aree in cui soggiornare, compatibili con le preferenze dell'utente.
  5. Fornisci previsioni meteorologiche essenziali e attività alternative in caso di maltempo.
  6. Fornisci una stima dettagliata dei costi suddivisa in alloggio, trasporti, pasti e attività.

  Requisiti di output:
  - L'itinerario deve essere realistico, credibile e adatto a una vera guida di viaggio.
  - L'itinerario deve essere strutturato in formato JSON per una facile integrazione in un'interfaccia utente.
  - Il tono deve essere pratico, chiaro e amichevole.
  - Assumi la persona di un "viaggio in tasca".

  Esempio di Output:
  {
    "itinerary": [
      {
        "day": "Giorno 1",
        "morning": "Visita alla Sagrada Familia",
        "lunch": "Pranzo a base di tapas a Ciudad Condal",
        "afternoon": "Passeggiata nel Parco Güell",
        "evening": "Spettacolo di Flamenco nel Quartiere Gotico"
      },
      {
        "day": "Giorno 2",
        "morning": "Esplorazione del Quartiere Gotico",
        "lunch": "Paella vicino alla spiaggia della Barceloneta",
        "afternoon": "Relax sulla spiaggia della Barceloneta",
        "evening": "Cena in un ristorante con terrazza panoramica"
      }
    ],
    "accommodationSuggestions": "Quartiere Gotico, Eixample",
    "costEstimates": {
      "accommodation": "100€-200€/notte",
      "transport": "20€/giorno",
      "meals": "50€/giorno",
      "activities": "30€/giorno"
    },
    "weatherForecast": "Soleggiato, 25°C. In caso di pioggia, visita musei come il Museo Picasso."
  }

  Restituisci l'output in formato JSON.
  `,
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
