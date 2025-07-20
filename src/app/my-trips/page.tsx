'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getTripsForUser, type TripData } from '@/services/trips-service';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function MyTripsPage() {
  const { user, isPremium, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isPremium) {
        router.push('/planner');
      } else {
        const fetchTrips = async () => {
          setIsLoading(true);
          try {
            const userTrips = await getTripsForUser(user.uid);
            setTrips(userTrips);
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchTrips();
      }
    }
  }, [user, isPremium, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="space-y-4 mb-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
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
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold text-foreground">I Miei Viaggi</h1>
                <p className="text-lg text-muted-foreground">Qui trovi tutti i tuoi itinerari salvati.</p>
            </div>
            <Button asChild>
                <Link href="/planner">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crea Nuovo Viaggio
                </Link>
            </Button>
        </div>

        {trips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> {trip.destination}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <Calendar className="h-4 w-4" /> 
                    {format(new Date(trip.startDate), 'd MMM yyyy', { locale: it })} - {format(new Date(trip.endDate), 'd MMM yyyy', { locale: it })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/my-trips/${trip.id}`}>Vedi Itinerario</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">Nessun viaggio salvato</h2>
            <p className="text-muted-foreground mt-2">Crea il tuo primo itinerario per vederlo qui.</p>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
