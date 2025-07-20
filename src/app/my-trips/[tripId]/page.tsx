'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getTripById, type TripData } from '@/services/trips-service';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ItineraryDisplay } from '@/components/itinerary-display';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SavedTripPage() {
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }

      if (tripId) {
        const fetchTrip = async () => {
          setIsLoading(true);
          try {
            const tripData = await getTripById(tripId);
            if (!tripData || tripData.userId !== user.uid) {
              setError("Viaggio non trovato o non hai i permessi per vederlo.");
            } else {
              setTrip(tripData);
            }
          } catch (e) {
            setError("Si è verificato un errore nel caricamento del viaggio.");
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTrip();
      }
    }
  }, [user, authLoading, router, tripId]);

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-2/3 mx-auto mb-8" />
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Oops! Qualcosa è andato storto.</h1>
                <p className="text-muted-foreground">{error}</p>
                 <Button onClick={() => router.push('/my-trips')} className="mt-6">Torna ai tuoi viaggi</Button>
            </main>
            <AppFooter />
        </div>
    );
  }

  if (!trip) {
    // This case should ideally be covered by the error state, but as a fallback:
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8 text-center">
                <p>Viaggio non trovato.</p>
            </main>
            <AppFooter />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <div className='flex justify-between items-center mb-8'>
                <h1 className="text-4xl font-bold text-foreground">Itinerario per {trip.destination}</h1>
                <div className='flex gap-2'>
                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Modifica</Button>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Elimina</Button>
                </div>
            </div>
            <ItineraryDisplay 
                itineraryData={trip.itineraryData} 
                packingListData={trip.packingListData}
                isSavedTrip={true}
            />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
