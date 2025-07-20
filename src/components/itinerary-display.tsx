'use client';

import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Bus, CloudRain, MapPin, Sun, Utensils, Wallet } from 'lucide-react';

interface ItineraryDisplayProps {
  data: GenerateItineraryOutput;
}

const InfoCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string | React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-lg font-bold">{content}</div>
    </CardContent>
  </Card>
);


export function ItineraryDisplay({ data }: ItineraryDisplayProps) {
  const { itinerary, costEstimates, accommodationSuggestions, weatherForecast } = data;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground font-headline">Il Tuo Itinerario Personalizzato</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {costEstimates ? (
            <>
                <InfoCard icon={<Wallet className="h-4 w-4" />} title="Alloggio" content={costEstimates.accommodation} />
                <InfoCard icon={<Bus className="h-4 w-4" />} title="Trasporti" content={costEstimates.transport} />
                <InfoCard icon={<Utensils className="h-4 w-4" />} title="Pasti" content={costEstimates.meals} />
                <InfoCard icon={<MapPin className="h-4 w-4" />} title="Attività" content={costEstimates.activities} />
            </>
        ) : <Card><CardContent><p className="p-4">Stime dei costi non disponibili.</p></CardContent></Card>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Piano Giornaliero</CardTitle>
        </CardHeader>
        <CardContent>
          {itinerary && itinerary.length > 0 ? (
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {itinerary.map((day, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">{day.day}</AccordionTrigger>
                  <AccordionContent className="space-y-4 pl-2">
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Mattina</Badge>
                      <p className="text-muted-foreground">{day.morning}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Pranzo</Badge>
                      <p className="text-muted-foreground">{day.lunch}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Pomeriggio</Badge>
                      <p className="text-muted-foreground">{day.afternoon}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Sera</Badge>
                      <p className="text-muted-foreground">{day.evening}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">L'itinerario non è stato generato correttamente.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <BedDouble className="h-6 w-6 text-primary" />
                <CardTitle>Dove Alloggiare</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{accommodationSuggestions}</p>
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
