'use client';

import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BedDouble, Bus, CloudRain, MapPin, Sun, Utensils, Wallet, Coffee, ShoppingBag, SunDim, Moon, AlertTriangle, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryDisplayProps {
  data: GenerateItineraryOutput;
}

const InfoCard = ({ icon, title, content, className }: { icon: React.ReactNode, title: string, content: string | React.ReactNode, className?: string }) => (
  <Card className={cn("shadow-md", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-xl font-bold">{content}</div>
    </CardContent>
  </Card>
);

const ActivityCard = ({ icon, timeOfDay, activity }: { icon: React.ReactNode, timeOfDay: string, activity: GenerateItineraryOutput['itinerary'][0]['morning']}) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`;
    return (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
            <div className="text-primary mt-1">{icon}</div>
            <div className='flex-1'>
                <p className="font-semibold text-foreground">{timeOfDay}</p>
                <p className="text-muted-foreground">{activity.description}</p>
                <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                    <MapPin className="h-3 w-3" />
                    {activity.location}
                </a>
            </div>
        </div>
    )
};

const AccommodationCard = ({ suggestion }: { suggestion: GenerateItineraryOutput['accommodationSuggestions'][0] }) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${suggestion.coordinates.lat},${suggestion.coordinates.lng}`;
    return (
      <div className="flex items-start gap-4 py-4 not-last:border-b">
        <div className="text-primary mt-1"><Building className="h-5 w-5" /></div>
        <div className='flex-1'>
          <p className="font-semibold text-foreground">{suggestion.name} - <span className="font-normal text-muted-foreground">{suggestion.zone}</span></p>
          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
          <a 
            href={mapsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
          >
            <MapPin className="h-3 w-3" />
            Vedi su Google Maps
          </a>
        </div>
      </div>
    );
  };


export function ItineraryDisplay({ data }: ItineraryDisplayProps) {
  const { itinerary, costEstimates, accommodationSuggestions, weatherForecast, potentialIssues } = data;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground font-headline">Il Tuo Itinerario Personalizzato</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {costEstimates ? (
            <>
                <InfoCard icon={<Wallet className="h-5 w-5" />} title="Alloggio" content={costEstimates.accommodation} className="bg-blue-50 dark:bg-blue-900/20" />
                <InfoCard icon={<Bus className="h-5 w-5" />} title="Trasporti" content={costEstimates.transport} className="bg-green-50 dark:bg-green-900/20" />
                <InfoCard icon={<Utensils className="h-5 w-5" />} title="Pasti" content={costEstimates.meals} className="bg-orange-50 dark:bg-orange-900/20" />
                <InfoCard icon={<ShoppingBag className="h-5 w-5" />} title="Attività" content={costEstimates.activities} className="bg-purple-50 dark:bg-purple-900/20" />
            </>
        ) : <Card><CardContent><p className="p-4">Stime dei costi non disponibili.</p></CardContent></Card>}
      </div>

        {itinerary && itinerary.length > 0 ? (
          <Card>
            <CardHeader>
                <CardTitle>Piano Giornaliero</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="day-0" className="w-full">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="p-0 bg-transparent">
                        {itinerary.map((day, index) => (
                            <TabsTrigger 
                                key={index} 
                                value={`day-${index}`}
                                className="mx-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md data-[state=inactive]:bg-card data-[state=inactive]:text-foreground"
                            >
                                {day.day}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  {itinerary.map((day, index) => (
                      <TabsContent key={index} value={`day-${index}`}>
                      <div className="space-y-4 pt-4 border-t mt-4">
                          <ActivityCard icon={<Coffee className="h-5 w-5" />} timeOfDay="Mattina" activity={day.morning} />
                          <ActivityCard icon={<Utensils className="h-5 w-5" />} timeOfDay="Pranzo" activity={day.lunch} />
                          <ActivityCard icon={<SunDim className="h-5 w-5" />} timeOfDay="Pomeriggio" activity={day.afternoon} />
                          <ActivityCard icon={<Moon className="h-5 w-5" />} timeOfDay="Sera" activity={day.evening} />
                      </div>
                      </TabsContent>
                  ))}
                </Tabs>
            </CardContent>
          </Card>
        ) : (
            <Card>
                <CardContent>
                    <p className="p-6 text-center text-muted-foreground">L'itinerario non è stato generato correttamente.</p>
                </CardContent>
            </Card>
        )}
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <BedDouble className="h-6 w-6 text-primary" />
                <CardTitle>Dove Alloggiare</CardTitle>
            </CardHeader>
            <CardContent>
                {accommodationSuggestions && accommodationSuggestions.length > 0 ? (
                    <div className="space-y-2">
                        {accommodationSuggestions.map((suggestion, index) => (
                            <AccommodationCard key={index} suggestion={suggestion} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Nessun suggerimento specifico per l'alloggio disponibile.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Avvisi di Viaggio</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{potentialIssues}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Sun className="h-6 w-6 text-yellow-500" />
                <CloudRain className="h-6 w-6 text-blue-400" />
                <CardTitle>Meteo e Piani di Riserva</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{weatherForecast}</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
