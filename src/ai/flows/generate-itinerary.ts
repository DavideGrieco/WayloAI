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

const ActivitySchema = z.object({
  description: z.string().describe("Descrizione dell'attività o del luogo."),
  location: z.string().describe("Nome del luogo (es. 'Colosseo', 'Ristorante da Mario')."),
  coordinates: z.object({
    lat: z.number().describe("La latitudine del luogo."),
    lng: z.number().describe("La longitudine del luogo."),
  }).describe("Coordinate geografiche per Google Maps."),
});

const AccommodationSuggestionSchema = z.object({
    name: z.string().describe("Nome dell'hotel o della struttura ricettiva."),
    zone: z.string().describe("La zona o il quartiere in cui si trova."),
    description: z.string().describe("Breve descrizione dell'hotel e perché è consigliato."),
    coordinates: z.object({
        lat: z.number().describe("La latitudine del luogo."),
        lng: z.number().describe("La longitudine del luogo."),
    }).describe("Coordinate geografiche per Google Maps."),
});

const ItineraryDaySchema = z.object({
    day: z.string().describe("Il giorno dell'itinerario (es. Giorno 1, Giorno 2)."),
    morning: ActivitySchema.describe("Attività per la mattina."),
    lunch: ActivitySchema.describe("Suggerimento per il pranzo."),
    afternoon: ActivitySchema.describe("Attività per il pomeriggio."),
    evening: ActivitySchema.describe("Attività per la sera."),
});

const CostEstimatesSchema = z.object({
    accommodation: z.string().describe("Stima dei costi per l'alloggio (es. '100€-200€/notte')."),
    transport: z.string().describe("Stima dei costi per i trasporti (es. '20€/giorno')."),
    meals: z.string().describe("Stima dei costi per i pasti (es. '50€/giorno')."),
    activities: z.string().describe("Stima dei costi per le attività (es. '30€/giorno')."),
});

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(ItineraryDaySchema).describe('Un itinerario con attività giornaliere, fasce orarie e descrizioni.'),
  accommodationSuggestions: z.array(AccommodationSuggestionSchema).describe('Suggerimenti specifici per l\'alloggio, con nome, zona, descrizione e coordinate.'),
  potentialIssues: z.string().describe("Avvisi su potenziali problemi come zone pericolose, costi elevati, problemi di trasporto, ecc."),
  costEstimates: CostEstimatesSchema.describe('Stime dettagliate dei costi suddivise in alloggio, trasporti, pasti e attività.'),
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
  prompt: `Sei un assistente di viaggio AI chiamato Waylo. Il tuo obiettivo è generare un itinerario personalizzato giorno per giorno per l'utente in base alla destinazione, alle date, agli interessi e al budget. La risposta DEVE essere in italiano e l'output DEVE essere in formato JSON valido. Per ogni attività e suggerimento di alloggio, fornisci coordinate geografiche REALI e PRECISE.

  Destinazione: {{destination}}
  Data di inizio: {{startDate}}
  Data di fine: {{endDate}}
  Interessi: {{interests}}
  Budget: {{budget}}

  Istruzioni:
  1. Genera un itinerario giorno per giorno con attività suddivise per fasce orarie (mattina, pranzo, pomeriggio, sera).
  2. Per ogni attività (morning, lunch, afternoon, evening), fornisci un oggetto con 'description', 'location', e 'coordinates' (lat, lng).
  3. Ottimizza l'itinerario geograficamente per evitare spostamenti inutili.
  4. Fornisci una lista di 2-3 suggerimenti di alloggio specifici ('accommodationSuggestions'). Ogni suggerimento deve essere un oggetto con 'name' (es. 'Hotel Roma'), 'zone' (es. 'Centro Storico'), 'description', e 'coordinates' (lat, lng).
  5. Fornisci avvisi su potenziali problemi ('potentialIssues') come zone pericolose, costi elevati, problemi con i trasporti, ecc.
  6. Fornisci previsioni meteorologiche essenziali ('weatherForecast') e attività alternative in caso di maltempo.
  7. Fornisci una stima dettagliata dei costi ('costEstimates') suddivisa in alloggio, trasporti, pasti e attività.
  
  Requisiti di output:
  - L'itinerario deve essere realistico, credibile e adatto a una vera guida di viaggio.
  - Il tono deve essere pratico, chiaro e amichevole.
  - Assumi la persona di un "viaggio in tasca".

  Esempio di Output JSON:
  {
    "itinerary": [
      {
        "day": "Giorno 1",
        "morning": { "description": "Visita alla Sagrada Familia", "location": "Sagrada Familia", "coordinates": { "lat": 41.4036, "lng": 2.1744 } },
        "lunch": { "description": "Pranzo a base di tapas", "location": "Ciudad Condal", "coordinates": { "lat": 41.3917, "lng": 2.1645 } },
        "afternoon": { "description": "Passeggiata nel Parco Güell", "location": "Parco Güell", "coordinates": { "lat": 41.4145, "lng": 2.1527 } },
        "evening": { "description": "Spettacolo di Flamenco", "location": "Tarantos", "coordinates": { "lat": 41.3825, "lng": 2.1769 } }
      }
    ],
    "accommodationSuggestions": [
        { "name": "Hotel Colonial", "zone": "Quartiere Gotico", "description": "Ottimo hotel 4 stelle nel cuore del centro storico, vicino a molte attrazioni.", "coordinates": { "lat": 41.3854, "lng": 2.1802 } },
        { "name": "Praktik Rambla", "zone": "Eixample", "description": "Boutique hotel con un design unico, perfetto per chi ama lo shopping e l'architettura.", "coordinates": { "lat": 41.3904, "lng": 2.1658 } }
    ],
    "potentialIssues": "Attenzione ai borseggiatori nelle zone turistiche affollate come La Rambla. I taxi possono essere costosi; preferire la metropolitana.",
    "costEstimates": {
      "accommodation": "120€-250€/notte",
      "transport": "25€/giorno",
      "meals": "60€/giorno",
      "activities": "40€/giorno"
    },
    "weatherForecast": "Soleggiato, 25°C. In caso di pioggia, visita musei come il Museo Picasso."
  }

  Restituisci l'output ESCLUSIVAMENTE in formato JSON valido. Non includere testo o commenti al di fuori del JSON.
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
    
    // A volte l'AI potrebbe restituire il JSON come una stringa dentro un'altra stringa.
    if (typeof output === 'string') {
        try {
            return JSON.parse(output) as GenerateItineraryOutput;
        } catch (e) {
            console.error("Failed to parse stringified JSON from AI, returning raw output.", e);
        }
    }
    
    return output!;
  }
);
