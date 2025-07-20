'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { generateItinerary } from '@/ai/flows/generate-itinerary';
import { AppHeader } from '@/components/app-header';
import { ItineraryForm, type ItineraryFormValues } from '@/components/itinerary-form';
import { ItineraryDisplay } from '@/components/itinerary-display';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlannerPage() {
  const [itineraryData, setItineraryData] = useState<GenerateItineraryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (data: ItineraryFormValues) => {
    setIsLoading(true);
    setItineraryData(null);

    try {
      const result = await generateItinerary({
        ...data,
        startDate: data.dates.from?.toISOString().split('T')[0] ?? '',
        endDate: data.dates.to?.toISOString().split('T')[0] ?? '',
      });
      setItineraryData(result);
    } catch (error) {
      console.error('Errore nella generazione dell\'itinerario:', error);
      toast({
        title: 'Si è verificato un errore',
        description: 'Non siamo riusciti a generare il tuo itinerario. Controlla i dati inseriti e riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-full mx-auto mb-8" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <section id="form-section" className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-headline">
              Il Tuo Viaggio Personalizzato, in Pochi Secondi
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Dicci la tua destinazione, le date, gli interessi e il budget. Waylo AI creerà un itinerario unico, giorno per giorno, solo per te.
            </p>
            <ItineraryForm onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          <section id="itinerary-section">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg shadow-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground font-headline">Creando la tua avventura...</h2>
                <p className="text-muted-foreground">Potrebbe volerci un momento. I grandi viaggi richiedono un po' di pianificazione!</p>
              </div>
            )}
            {!isLoading && itineraryData && (
              <div className="animate-in fade-in-50 duration-500">
                <ItineraryDisplay data={itineraryData} />
              </div>
            )}
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
