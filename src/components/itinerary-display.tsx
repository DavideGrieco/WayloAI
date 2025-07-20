
'use client';

import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import type { GeneratePackingListOutput } from '@/ai/flows/generate-packing-list';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BedDouble, Bus, CloudRain, MapPin, Sun, Utensils, Wallet, AlertTriangle, Building, PartyPopper, Landmark, TramFront, Circle, Briefcase, Shirt, FileText, Router, Stethoscope, Sparkles, Footprints, Camera, BatteryCharging, BookOpen, Headphones, Plug, Pill, Glasses, Umbrella, Plane, Train, Car, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface ItineraryDisplayProps {
  itineraryData: GenerateItineraryOutput;
  packingListData: GeneratePackingListOutput | null;
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

const ActivityTimeline = ({ activities }: { activities: GenerateItineraryOutput['itinerary'][0]['activities'] }) => {
    const getIconForType = (type: 'activity' | 'food' | 'transport') => {
        switch (type) {
            case 'activity': return <Landmark className="h-5 w-5 text-primary" />;
            case 'food': return <Utensils className="h-5 w-5 text-orange-500" />;
            case 'transport': return <TramFront className="h-5 w-5 text-green-500" />;
            default: return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="relative pl-8">
            <div className="absolute left-3 top-0 h-full w-0.5 bg-border"></div>
            
            <div className="space-y-8">
                {activities.map((activity, index) => {
                    const mapsUrl = activity.coordinates ? `https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}` : null;
                    return (
                        <div key={index} className="relative flex items-start">
                            <div className="absolute -left-0.5 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background">
                                {getIconForType(activity.type)}
                            </div>
                            
                            <div className="pl-8 flex-1">
                                <p className="font-bold text-foreground">{activity.time}</p>
                                <p className="font-semibold text-foreground mt-1">{activity.description}</p>
                                {mapsUrl && activity.details ? (
                                     <a 
                                        href={mapsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                                    >
                                        <MapPin className="h-3 w-3" />
                                        {activity.details}
                                    </a>
                                ) : (
                                    <p className="text-muted-foreground text-sm">{activity.details}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const AccommodationCard = ({ suggestion }: { suggestion: GenerateItineraryOutput['accommodationSuggestions'][0] }) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${suggestion.coordinates.lat},${suggestion.coordinates.lng}`;
    return (
      <div className="flex items-start gap-4 py-4 not-last:border-b">
        <div className="text-primary mt-1"><Building className="h-5 w-5" /></div>
        <div className='flex-1'>
          <p className="font-semibold text-foreground">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {suggestion.name}
            </a>
            <span className="font-normal text-muted-foreground"> - {suggestion.zone}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
        </div>
      </div>
    );
  };

  const getPackingCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('abbigliamento')) return <Shirt className="h-6 w-6 text-blue-500" />;
    if (cat.includes('documenti')) return <FileText className="h-6 w-6 text-red-500" />;
    if (cat.includes('elettronica')) return <Router className="h-6 w-6 text-gray-500" />;
    if (cat.includes('articoli da toeletta') || cat.includes('farmaci')) return <Stethoscope className="h-6 w-6 text-green-500" />;
    if (cat.includes('extra')) return <Sparkles className="h-6 w-6 text-yellow-500" />;
    return <Briefcase className="h-6 w-6 text-muted-foreground" />;
};

const getPackingItemIcon = (itemName: string): React.ReactNode => {
    const name = itemName.toLowerCase();
    
    // Abbigliamento
    if (name.includes('pantaloni')) return <Gem className="text-blue-600" />;
    if (name.includes('camicia') || name.includes('magliett') || name.includes('top')) return <Shirt className="text-blue-500" />;
    if (name.includes('scarpe') || name.includes('stivali')) return <Footprints className="text-yellow-700" />;
    if (name.includes('giacca') || name.includes('cappotto')) return <Gem className="text-gray-600" />; // Non c'è un'icona per giacca, uso Gem
    if (name.includes('calzini')) return <Gem className="text-gray-500" />;
    if (name.includes('occhiali')) return <Glasses className="text-purple-500" />;
    if (name.includes('costume')) return <Gem className="text-teal-500" />;

    // Documenti
    if (name.includes('passaporto') || name.includes('carta d\'identità')) return <FileText className="text-red-600" />;
    if (name.includes('bigliett')) return <Plane className="text-red-500" />;
    if (name.includes('prenotazion')) return <BookOpen className="text-red-400" />;

    // Elettronica
    if (name.includes('telefono') || name.includes('smartphone')) return <Router className="text-gray-700" />;
    if (name.includes('caricabatteri') || name.includes('power bank')) return <BatteryCharging className="text-gray-600" />;
    if (name.includes('adattatore')) return <Plug className="text-gray-500" />;
    if (name.includes('cuffie')) return <Headphones className="text-gray-800" />;
    if (name.includes('fotocamera')) return <Camera className="text-gray-900" />;
    
    // Articoli da toeletta & Farmaci
    if (name.includes('spazzolino') || name.includes('dentifricio')) return <Gem className="text-green-600" />; // No icon for tooth
    if (name.includes('farmaci') || name.includes('medicinali') || name.includes('kit primo soccorso')) return <Pill className="text-green-500" />;
    if (name.includes('crema solare')) return <Sun className="text-green-400" />;

    // Extra
    if (name.includes('ombrello')) return <Umbrella className="text-yellow-500" />;
    if (name.includes('libro')) return <BookOpen className="text-yellow-600" />;

    return <Circle className="h-4 w-4 text-muted-foreground" />;
};


const PackingListDisplay = ({ data }: { data: GeneratePackingListOutput }) => {
  return (
    <div className="space-y-6 pt-6">
       <Card className="bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle>Consiglio Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.generalAdvice}</p>
          </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={data.packingList.map(c => c.category)} className="w-full">
        {data.packingList.map((category, index) => (
          <AccordionItem key={index} value={category.category}>
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-3">
                {getPackingCategoryIcon(category.category)}
                {category.category}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3 pl-4">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex flex-col p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className='flex items-center justify-between'>
                      <div className="flex items-center gap-3">
                        {getPackingItemIcon(item.name)}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{item.quantity}</span>
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-2 pl-7">{item.notes}</p>}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export function ItineraryDisplay({ itineraryData, packingListData }: ItineraryDisplayProps) {
  const { itinerary, costEstimates, accommodationSuggestions, weatherForecast, potentialIssues, localEvents } = itineraryData;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center text-foreground font-headline">Il Tuo Itinerario Personalizzato</h2>
      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
            <TabsTrigger value="packing" disabled={!packingListData}>Valigia</TabsTrigger>
        </TabsList>
        <TabsContent value="itinerary">
            <div className="space-y-8 pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {costEstimates ? (
                        <>
                            <InfoCard icon={<Wallet className="h-5 w-5" />} title="Alloggio" content={costEstimates.accommodation} className="bg-blue-50 dark:bg-blue-900/20" />
                            <InfoCard icon={<Bus className="h-5 w-5" />} title="Trasporti" content={costEstimates.transport} className="bg-green-50 dark:bg-green-900/20" />
                            <InfoCard icon={<Utensils className="h-5 w-5" />} title="Pasti" content={costEstimates.meals} className="bg-orange-50 dark:bg-orange-900/20" />
                            <InfoCard icon={<Landmark className="h-5 w-5" />} title="Attività" content={costEstimates.activities} className="bg-purple-50 dark:bg-purple-900/20" />
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
                                <div className="pt-6 border-t mt-4">
                                    <ActivityTimeline activities={day.activities} />
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
                
                {localEvents && localEvents.toLowerCase() !== 'nessun evento speciale previsto' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                            <PartyPopper className="h-6 w-6 text-accent" />
                            <CardTitle>Eventi Locali</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{localEvents}</p>
                        </CardContent>
                    </Card>
                )}

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
        </TabsContent>
        <TabsContent value="packing">
            {packingListData ? <PackingListDisplay data={packingListData} /> : <p>Lista valigia in preparazione...</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
