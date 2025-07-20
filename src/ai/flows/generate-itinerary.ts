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
  arrivalTime: z.string().optional().describe("L'orario di arrivo del primo giorno (es. '14:30'), per ottimizzare il primo giorno."),
  departureTime: z.string().optional().describe("L'orario di partenza dell'ultimo giorno (es. '18:00'), per ottimizzare l'ultimo giorno."),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const ActivitySchema = z.object({
  time: z.string().describe("L'orario dell'attività (es. '09:00 - 11:00')."),
  type: z.enum(['activity', 'food', 'transport']).describe("Il tipo di evento: 'activity' per visite, 'food' per pasti, 'transport' per spostamenti."),
  description: z.string().describe("Descrizione dell'attività, del pasto o del mezzo di trasporto."),
  details: z.string().describe("Dettagli aggiuntivi, come il nome del luogo o del ristorante. Deve essere un nome di luogo REALE e cliccabile."),
  coordinates: z.object({
    lat: z.number().describe("La latitudine del luogo."),
    lng: z.number().describe("La longitudine del luogo."),
  }).optional().describe("Coordinate geografiche per Google Maps, se applicabile (non per i trasporti)."),
});

const AccommodationSuggestionSchema = z.object({
    name: z.string().describe("Nome dell'hotel o della struttura ricettiva. Deve essere un nome REALE e cliccabile."),
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
  prompt: `Sei un assistente di viaggio AI chiamato Waylo. Il tuo obiettivo è generare un itinerario personalizzato, estremamente dettagliato e realistico per l'utente, basandoti su dati precisi. La risposta DEVE essere in italiano e l'output DEVE essere in formato JSON valido. Per ogni luogo, fornisci nomi REALI e coordinate geografiche PRECISE.

  Dati utente:
  - Destinazione: {{destination}}
  - Data di inizio: {{startDate}}
  - Data di fine: {{endDate}}
  - Interessi: {{interests}}
  - Budget: {{budget}}
  - Tipo di viaggiatore: {{travelerType}}
  - Ritmo del viaggio: {{travelPace}}
  {{#if arrivalTime}}- Orario di arrivo (primo giorno): {{arrivalTime}}{{/if}}
  {{#if departureTime}}- Orario di partenza (ultimo giorno): {{departureTime}}{{/if}}

  Istruzioni Obbligatorie:
  1.  Genera un itinerario giorno per giorno. L'output deve essere una guida completa e utilizzabile.
  2.  Per ogni giorno, il campo 'day' deve includere sia il numero del giorno che la data (es. "Giorno 1: 11 Agosto").
  3.  Ogni evento nella lista 'activities' deve essere un oggetto con 'time' (es. "10:00 - 11:30"), 'type' ('activity', 'food', o 'transport'), 'description', 'details' (che deve contenere il nome REALE e SPECIFICO del luogo, es. "Colosseo", "Trattoria da Enzo al 29"), e 'coordinates'.
  4.  I nomi dei luoghi ('details') devono essere reali e verificabili. Non inventare nomi.
  5.  **Critico: Cerca attivamente eventuali feste, sagre, concerti, festività nazionali (es. Ferragosto il 15 Agosto) o altri eventi locali che si svolgono nella destinazione durante le date del viaggio. Includi queste informazioni nel campo 'localEvents'. Se non trovi nulla, scrivi 'Nessun evento speciale previsto'. Sii molto accurato su questo punto.**
  6.  Ottimizza l'itinerario logisticamente e geograficamente. Includi gli spostamenti ('transport') tra le attività principali, specificando il mezzo (es. "Metro Linea A", "Autobus 64").
  7.  Tieni conto degli orari di arrivo e partenza per costruire il primo e l'ultimo giorno.
  8.  Fornisci una lista di 2-3 suggerimenti di alloggio specifici ('accommodationSuggestions'), con nomi di hotel REALI e cliccabili.
  9.  Fornisci avvisi su potenziali problemi ('potentialIssues') come zone da evitare, scioperi, costi nascosti, ecc.
  10. Fornisci previsioni meteorologiche essenziali ('weatherForecast').
  11. Fornisci una stima dettagliata dei costi ('costEstimates').

  Requisiti di output:
  -   L'itinerario deve essere realistico e molto dettagliato, includendo la logistica degli spostamenti e nomi di luoghi reali.
  -   Il tono deve essere pratico, chiaro e amichevole.

  Esempio di Output JSON per un'attività:
  {
    "time": "10:00 - 12:30",
    "type": "activity",
    "description": "Visita al Colosseo, Foro Romano e Palatino",
    "details": "Colosseo",
    "coordinates": { "lat": 41.8902, "lng": 12.4922 }
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
