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
  travelerType: z.string().describe("Il tipo di viaggiatore (es. 'Coppia', 'Famiglia con bambini', 'Amici', 'Solo')."),
  travelPace: z.string().describe("Il ritmo desiderato del viaggio (es. 'Rilassato', 'Moderato', 'Intenso')."),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const ActivitySchema = z.object({
  time: z.string().describe("L'orario dell'attività (es. '09:00 - 11:00')."),
  type: z.enum(['activity', 'food', 'transport']).describe("Il tipo di evento: 'activity' per visite, 'food' per pasti, 'transport' per spostamenti."),
  description: z.string().describe("Descrizione dell'attività, del pasto o del mezzo di trasporto."),
  details: z.string().describe("Dettagli aggiuntivi, come il nome del luogo o del ristorante."),
  coordinates: z.object({
    lat: z.number().describe("La latitudine del luogo."),
    lng: z.number().describe("La longitudine del luogo."),
  }).optional().describe("Coordinate geografiche per Google Maps, se applicabile (non per i trasporti)."),
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
    day: z.string().describe("Il giorno dell'itinerario (es. Giorno 1: 11 Agosto)."),
    activities: z.array(ActivitySchema).describe("Un elenco di attività, pasti e trasporti per la giornata in ordine cronologico."),
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
  localEvents: z.string().describe("Descrizione di eventuali feste, eventi speciali o festività locali (incluso festività nazionali come Ferragosto) che si svolgono durante le date del viaggio. Se non ci sono eventi, indica 'Nessun evento speciale previsto'."),
});

export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const itineraryPrompt = ai.definePrompt({
  name: 'itineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  prompt: `Sei un assistente di viaggio AI chiamato Waylo. Il tuo obiettivo è generare un itinerario personalizzato e molto dettagliato per l'utente in base alla destinazione, alle date, agli interessi e al budget. La risposta DEVE essere in italiano e l'output DEVE essere in formato JSON valido. Per ogni luogo, fornisci coordinate geografiche REALI e PRECISE.

  Destinazione: {{destination}}
  Data di inizio: {{startDate}}
  Data di fine: {{endDate}}
  Interessi: {{interests}}
  Budget: {{budget}}
  Tipo di viaggiatore: {{travelerType}}
  Ritmo del viaggio: {{travelPace}}

  Istruzioni:
  1.  Genera un itinerario giorno per giorno. Per ogni giorno, fornisci una lista cronologica di eventi.
  2.  Per ogni giorno, il campo 'day' deve includere sia il numero del giorno che la data (es. "Giorno 1: 11 Agosto").
  3.  Ogni evento nella lista 'activities' deve essere un oggetto con 'time' (es. "10:00 - 11:30"), 'type' ('activity', 'food', o 'transport'), 'description', 'details' (es. nome del museo, ristorante, o "Spostamento con metro Linea A"), e 'coordinates' se applicabile.
  4.  **IMPORTANTE: Cerca attivamente eventuali feste, sagre, concerti, festività nazionali (es. Ferragosto il 15 Agosto) o altri eventi locali che si svolgono nella destinazione durante le date del viaggio. Includi queste informazioni nel campo 'localEvents'. Se non trovi nulla, scrivi 'Nessun evento speciale previsto'.**
  5.  Ottimizza l'itinerario geograficamente e includi gli spostamenti ('transport') tra le attività principali.
  6.  Fornisci una lista di 2-3 suggerimenti di alloggio specifici ('accommodationSuggestions').
  7.  Fornisci avvisi su potenziali problemi ('potentialIssues').
  8.  Fornisci previsioni meteorologiche essenziali ('weatherForecast').
  9.  Fornisci una stima dettagliata dei costi ('costEstimates').
  
  Requisiti di output:
  -   L'itinerario deve essere realistico, credibile e molto dettagliato, includendo la logistica degli spostamenti.
  -   Il tono deve essere pratico, chiaro e amichevole.

  Esempio di Output JSON per un giorno:
  "itinerary": [
    {
      "day": "Giorno 1: 11 Agosto",
      "activities": [
        { "time": "09:30 - 10:00", "type": "transport", "description": "Spostamento verso il Colosseo", "details": "Metro Linea B, fermata Colosseo", "coordinates": null },
        { "time": "10:00 - 12:30", "type": "activity", "description": "Visita al Colosseo, Foro Romano e Palatino", "details": "Colosseo", "coordinates": { "lat": 41.8902, "lng": 12.4922 } },
        { "time": "13:00 - 14:00", "type": "food", "description": "Pranzo tipico romano", "details": "Hostaria da Nerone", "coordinates": { "lat": 41.8907, "lng": 12.4950 } },
        { "time": "14:00 - 14:30", "type": "transport", "description": "Passeggiata verso i Musei Vaticani", "details": "Autobus linea 64", "coordinates": null }
      ]
    }
  ],
  // ... resto dell'output ...

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
