'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'La destinazione deve avere almeno 2 caratteri.' }),
  dates: z.object({
    from: z.date({ required_error: 'È richiesta una data di inizio.' }),
    to: z.date({ required_error: 'È richiesta una data di fine.' }),
  }),
  interests: z.string().min(3, { message: 'Elenca almeno un interesse.' }),
  budget: z.string().min(2, { message: 'Fornisci una stima del budget.' }),
  travelerType: z.string({ required_error: 'Seleziona il tipo di viaggiatore.' }),
  travelPace: z.string({ required_error: 'Seleziona il ritmo del viaggio.' }),
});

export type ItineraryFormValues = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  onSubmit: (values: ItineraryFormValues) => void;
  isLoading: boolean;
}

export function ItineraryForm({ onSubmit, isLoading }: ItineraryFormProps) {
  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      interests: '',
      budget: '',
      travelerType: 'Coppia',
      travelPace: 'Moderato',
    },
  });

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinazione</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Barcellona" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date del viaggio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value?.from && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, 'LLL dd, y', { locale: it })} -{' '}
                                  {format(field.value.to, 'LLL dd, y', { locale: it })}
                                </>
                              ) : (
                                format(field.value.from, 'LLL dd, y', { locale: it })
                              )
                            ) : (
                              <span>Scegli un intervallo di date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value as DateRange}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                          locale={it}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interessi</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Cultura, natura, gastronomia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="es. 500€ - 1000€" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="travelerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di Viaggiatore</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un'opzione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Coppia">Coppia</SelectItem>
                        <SelectItem value="Famiglia con bambini">Famiglia con bambini</SelectItem>
                        <SelectItem value="Amici">Gruppo di amici</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelPace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ritmo del Viaggio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un'opzione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Rilassato">Rilassato</SelectItem>
                        <SelectItem value="Moderato">Moderato</SelectItem>
                        <SelectItem value="Intenso">Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Genera Itinerario
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
