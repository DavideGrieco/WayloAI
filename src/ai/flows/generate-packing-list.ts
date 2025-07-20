'use server';

/**
 * @fileOverview Packing list generation flow using Genkit.
 *
 * - generatePackingList - A function that generates a personalized packing list.
 * - GeneratePackingListInput - The input type for the generatePackingList function.
 * - GeneratePackingListOutput - The return type for the generatePackingList function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePackingListInputSchema = z.object({
  destination: z.string().describe('La città di destinazione del viaggio.'),
  startDate: z.string().describe('La data di inizio del viaggio (YYYY-MM-DD).'),
  endDate: z.string().describe('La data di fine del viaggio (YYYY-MM-DD).'),
  travelerType: z.string().describe("Il tipo di viaggiatore (es. 'Coppia', 'Famiglia con bambini', 'Amici', 'Solo')."),
  interests: z.string().describe('Elenco di interessi separati da virgole che potrebbero influenzare cosa portare (es. trekking, spiaggia, vita notturna).'),
});
export type GeneratePackingListInput = z.infer<typeof GeneratePackingListInputSchema>;

const PackingItemSchema = z.object({
    name: z.string().describe('Nome dell\'oggetto da mettere in valigia.'),
    quantity: z.string().describe('Quantità suggerita (es. "2", "1 per ogni giorno").'),
    notes: z.string().optional().describe('Note o consigli aggiuntivi per questo oggetto.'),
});

const PackingCategorySchema = z.object({
    category: z.string().describe('Nome della categoria (es. "Abbigliamento", "Documenti", "Elettronica", "Articoli da toeletta", "Extra").'),
    items: z.array(PackingItemSchema).describe('Elenco degli oggetti in questa categoria.'),
});

const GeneratePackingListOutputSchema = z.object({
  packingList: z.array(PackingCategorySchema).describe('Una lista di cose da mettere in valigia, suddivisa per categorie.'),
  generalAdvice: z.string().describe('Un consiglio generale sulla preparazione della valigia per questa specifica destinazione e periodo.'),
});
export type GeneratePackingListOutput = z.infer<typeof GeneratePackingListOutputSchema>;

export async function generatePackingList(input: GeneratePackingListInput): Promise<GeneratePackingListOutput> {
  return generatePackingListFlow(input);
}

const packingListPrompt = ai.definePrompt({
  name: 'packingListPrompt',
  input: { schema: GeneratePackingListInputSchema },
  output: { schema: GeneratePackingListOutputSchema },
  prompt: `Sei un esperto assistente di viaggio AI chiamato Waylo. Il tuo compito è creare una checklist per la valigia dettagliata e personalizzata per un utente. La risposta DEVE essere in italiano e l'output in formato JSON valido.

Dati utente:
- Destinazione: {{destination}}
- Data di inizio: {{startDate}}
- Data di fine: {{endDate}}
- Tipo di viaggiatore: {{travelerType}}
- Interessi: {{interests}}

Istruzioni Obbligatorie:
1.  **Analizza il Clima:** Basa i suggerimenti sul clima previsto per la destinazione durante le date del viaggio.
2.  **Crea Categorie:** Suddividi la lista in categorie chiare come "Abbigliamento", "Documenti", "Elettronica", "Articoli da toeletta & Farmaci", e "Extra Utili".
3.  **Sii Specifico:** Fornisci suggerimenti specifici. Non dire solo "magliette", ma ad esempio "Magliette a maniche corte" e specifica la quantità.
4.  **Considera gli Interessi:** Adatta la lista agli interessi. Se l'utente menziona "trekking", includi "scarpe da trekking". Se menziona "spiaggia", includi "costume da bagno" e "telo mare".
5.  **Aggiungi Consigli:** Includi note utili dove appropriato. Ad esempio, per un caricabatterie, potresti aggiungere "Considera un power bank".
6.  **Fornisci un Consiglio Generale:** Termina con un consiglio generale sulla preparazione della valigia, come suggerimenti sul tipo di bagaglio (zaino vs. trolley) o su come risparmiare spazio.

Requisiti di output:
-   L'output deve essere ESCLUSIVAMENTE in formato JSON valido. Non includere testo o commenti al di fuori del JSON.
-   Il tono deve essere pratico, chiaro e amichevole.
`,
});


const generatePackingListFlow = ai.defineFlow(
    {
      name: 'generatePackingListFlow',
      inputSchema: GeneratePackingListInputSchema,
      outputSchema: GeneratePackingListOutputSchema,
    },
    async (input) => {
        const { output } = await packingListPrompt(input);
        
        if (typeof output === 'string') {
            try {
                return JSON.parse(output) as GeneratePackingListOutput;
            } catch (e) {
                console.error("Failed to parse stringified JSON from AI for packing list, returning raw output.", e);
            }
        }
        
        return output!;
    }
);
