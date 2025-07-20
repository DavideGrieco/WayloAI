'use client';

import { useState } from 'react';
import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { generateItinerary } from '@/ai/flows/generate-itinerary';
import { AppHeader } from '@/components/app-header';
import { ItineraryForm, type ItineraryFormValues } from '@/components/itinerary-form';
import { ItineraryDisplay } from '@/components/itinerary-display';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracker } from '@/hooks/use-usage-tracker';
import { Loader2 } from 'lucide-react';
import { AppFooter } from '@/components/app-footer';

export default function Home() {
  const [itineraryData, setItineraryData] = useState<GenerateItineraryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isReady, canGenerate, incrementUsage, getUsage } = useUsageTracker();

  const handleSubmit = async (data: ItineraryFormValues) => {
    if (!isReady) {
      toast({
        title: 'Please wait',
        description: 'Checking your usage limit...',
        variant: 'default',
      });
      return;
    }

    if (!canGenerate()) {
      toast({
        title: 'Monthly limit reached',
        description: 'You have used all 3 of your free itineraries for this month. Please try again next month.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setItineraryData(null);

    try {
      const result = await generateItinerary({
        ...data,
        startDate: data.dates.from?.toISOString().split('T')[0] ?? '',
        endDate: data.dates.to?.toISOString().split('T')[0] ?? '',
      });
      setItineraryData(result);
      incrementUsage();
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      toast({
        title: 'An error occurred',
        description: 'We couldn\'t generate your itinerary. Please check your inputs and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <section id="form-section" className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-headline">
              Your Personalized Trip, in Seconds
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tell us your destination, dates, interests, and budget. Waylo AI will craft a unique, day-by-day itinerary just for you.
            </p>
            <ItineraryForm onSubmit={handleSubmit} isLoading={isLoading} isUsageReady={isReady} />
            {isReady && (
                 <p className="text-sm text-muted-foreground mt-4">
                 You have {3 - getUsage().count} itineraries remaining this month.
               </p>
            )}
          </section>

          <section id="itinerary-section">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg shadow-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground font-headline">Crafting your adventure...</h2>
                <p className="text-muted-foreground">This may take a moment. Great trips take a little planning!</p>
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
