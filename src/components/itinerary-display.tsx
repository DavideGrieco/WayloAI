'use client';

import { useEffect, useState, useMemo } from 'react';
import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Utensils, Wallet, Sun, CloudRain, MapPin, Bus } from 'lucide-react';

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
      return JSON.parse(data.itinerary) as ItineraryDay[];
    } catch (e) {
      console.error('Failed to parse itinerary:', e);
      return null;
    }
  }, [data.itinerary]);

  const parsedCosts = useMemo(() => {
    try {
      // The AI might return an array with one object.
      const parsed = JSON.parse(data.costEstimates);
      return Array.isArray(parsed) ? parsed[0] : parsed as CostEstimates;
    } catch (e) {
      console.error('Failed to parse cost estimates:', e);
      return null;
    }
  }, [data.costEstimates]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground font-headline">Your Custom Itinerary</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {parsedCosts ? (
            <>
                <InfoCard icon={<Wallet className="h-4 w-4" />} title="Accommodation" content={parsedCosts.accommodation} />
                <InfoCard icon={<Bus className="h-4 w-4" />} title="Transport" content={parsedCosts.transport} />
                <InfoCard icon={<Utensils className="h-4 w-4" />} title="Meals" content={parsedCosts.meals} />
                <InfoCard icon={<MapPin className="h-4 w-4" />} title="Activities" content={parsedCosts.activities} />
            </>
        ) : <Card><CardContent><p className="p-4">{data.costEstimates}</p></CardContent></Card>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {parsedItinerary ? (
            <Accordion type="single" collapsible className="w-full">
              {parsedItinerary.map((day, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">{day.day}</AccordionTrigger>
                  <AccordionContent className="space-y-4 pl-2">
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Morning</Badge>
                      <p className="text-muted-foreground">{day.morning}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Lunch</Badge>
                      <p className="text-muted-foreground">{day.lunch}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Afternoon</Badge>
                      <p className="text-muted-foreground">{day.afternoon}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="mt-1">Evening</Badge>
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
                <CardTitle>Where to Stay</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{data.accommodationSuggestions}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Sun className="h-6 w-6 text-yellow-500" />
                <CardTitle>Weather & Backup Plans</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{data.weatherForecast}</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
