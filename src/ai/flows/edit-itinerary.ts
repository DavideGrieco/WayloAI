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

// We re-use the output schema from the itinerary generation flow, as the structure is the same.
// We just need to define the new input schema which includes the existing itinerary.
import { GenerateItineraryOutputSchema, GenerateItineraryInputSchema } from './generate-itinerary';

export const EditItineraryInputSchema = z.object({
    existingItinerary: GenerateItineraryOutputSchema.describe("L'itinerario di viaggio JSON esistente che deve essere modificato."),
    editRequest: z.string().describe("La richiesta specifica dell'utente per modificare l'itinerario (es. 'Aggiungi un'attività di shopping il giorno 2', 'Rendi il ritmo del primo giorno più rilassato')."),
    originalInput: GenerateItineraryInputSchema.optional().describe("I dati di input originali utilizzati per creare l'itinerario, per mantenere il contesto.")
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
  prompt: `Sei un assistente di viaggio AI chiamato Waylo. Il tuo compito è modificare un itinerario di viaggio esistente in base alla richiesta di un utente.

Dati Originali (se disponibili):
- Destinazione: {{originalInput.destination}}
- Date: {{originalInput.startDate}} a {{originalInput.endDate}}
- Interessi: {{originalInput.interests}}
- Budget: {{originalInput.budget}}
- Tipo di Viaggiatore: {{originalInput.travelerType}}
- Ritmo: {{originalInput.travelPace}}

Itinerario Esistente (in formato JSON):
{{{jsonStringify existingItinerary}}}

Richiesta di Modifica dell'Utente:
"{{editRequest}}"

Istruzioni Obbligatorie:
1.  Analizza la richiesta dell'utente e applica le modifiche necessarie all'itinerario esistente. NON rigenerare l'itinerario da capo.
2.  Mantieni la stessa struttura JSON dell'itinerario originale.
3.  Assicurati che i nomi dei luoghi rimangano REALI e le coordinate geografiche PRECISE.
4.  L'output deve essere ESCLUSIVAMENTE in formato JSON valido, rappresentando l'intero oggetto itinerario aggiornato. Non includere testo o commenti al di fuori del JSON.
5.  Se la richiesta non è chiara o è impossibile da soddisfare, modifica il campo 'potentialIssues' per spiegarlo gentilmente.
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
