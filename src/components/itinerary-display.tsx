'use client';

import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Bus, CloudRain, MapPin, Sun, Utensils, Wallet } from 'lucide-react';

type ItineraryDay = {
  day: string;
  morning: string;
  lunch: string;
  afternoon: string;
  evening: string;
};
type CostEstimates = {
  accommodation: string;
  transport: string;
  meals: string;
  activities: string;
};

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
  const parsedItinerary = useMemo(() => {
    try {
      // The AI might return a stringified JSON that is itself inside a string.
      const firstParse = JSON.parse(data.itinerary);
      if (typeof firstParse === 'string') {
        return JSON.parse(firstParse).itinerary as ItineraryDay[];
      }
      return (firstParse.itinerary || firstParse) as ItineraryDay[];
    } catch (e) {
      console.error('Failed to parse itinerary:', e, data.itinerary);
      return null;
    }
  }, [data.itinerary]);

  const parsedCosts = useMemo(() => {
    try {
       // AI might return a stringified JSON inside a string.
      const firstParse = JSON.parse(data.costEstimates);
      if (typeof firstParse === 'string') {
          const secondParse = JSON.parse(firstParse);
          return (Array.isArray(secondParse) ? secondParse[0] : secondParse) as CostEstimates
      }
      return (Array.isArray(firstParse) ? firstParse[0] : firstParse) as CostEstimates;
    } catch (e) {
      console.error('Failed to parse cost estimates:', e, data.costEstimates);
       try {
        // Fallback for when the AI returns a raw object string instead of JSON
        const estimates = data.costEstimates.match(/accommodation:\s*"([^"]+)",\s*transport:\s*"([^"]+)",\s*meals:\s*"([^"]+)",\s*activities:\s*"([^"]+)"/);
        if(estimates) {
            return {
                accommodation: estimates[1],
                transport: estimates[2],
                meals: estimates[3],
                activities: estimates[4],
            };
        }
        return null;
       } catch (fallbackError) {
        console.error('Fallback parsing failed for costs:', fallbackError);
        return null;
       }
    }
  }, [data.costEstimates]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground font-headline">Il Tuo Itinerario Personalizzato</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {parsedCosts ? (
            <>
                <InfoCard icon={<Wallet className="h-4 w-4" />} title="Alloggio" content={parsedCosts.accommodation} />
                <InfoCard icon={<Bus className="h-4 w-4" />} title="Trasporti" content={parsedCosts.transport} />
                <InfoCard icon={<Utensils className="h-4 w-4" />} title="Pasti" content={parsedCosts.meals} />
                <InfoCard icon={<MapPin className="h-4 w-4" />} title="Attività" content={parsedCosts.activities} />
            </>
        ) : <Card><CardContent><p className="p-4">{data.costEstimates}</p></CardContent></Card>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Piano Giornaliero</CardTitle>
        </CardHeader>
        <CardContent>
          {parsedItinerary ? (
            <Accordion type="single" collapsible className="w-full">
              {parsedItinerary.map((day, index) => (
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
            <p className="text-muted-foreground">{data.itinerary}</p>
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
                <p className="text-muted-foreground">{data.accommodationSuggestions}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Sun className="h-6 w-6 text-yellow-500" />
                <CloudRain className="h-6 w-6 text-blue-400" />
                <CardTitle>Meteo e Piani di Riserva</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{data.weatherForecast}</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
