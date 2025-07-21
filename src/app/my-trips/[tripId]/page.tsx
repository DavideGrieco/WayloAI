
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getTripById, deleteTrip, updateTrip, type TripData } from '@/services/trips-service';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ItineraryDisplay } from '@/components/itinerary-display';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Edit, Trash2, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { editItinerary, type EditItineraryInput } from '@/ai/flows/edit-itinerary';

export default function SavedTripPage() {
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    
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
            setTrip(null);
          } else {
            setTrip(tripData);
          }
        } catch (e) {
          setError("Si è verificato un errore nel caricamento del viaggio.");
          console.error(e);
          setTrip(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTrip();
    }
  }, [user, authLoading, router, tripId]);
  
  const handleDelete = async () => {
    if (!tripId) return;
    setIsDeleting(true);
    try {
        await deleteTrip(tripId);
        toast({
            title: "Viaggio eliminato",
            description: "Il tuo itinerario è stato eliminato con successo.",
        });
        router.push('/my-trips');
    } catch(e) {
        toast({
            title: "Errore",
            description: "Impossibile eliminare il viaggio. Riprova.",
            variant: "destructive",
        });
        setIsDeleting(false);
    }
  }

  const handleEditRequest = async () => {
    if (!editRequest || !trip || !trip.formValues || !trip.id) return;
    setIsEditing(true);

    try {
      const input: EditItineraryInput = {
        existingItinerary: trip.itineraryData,
        editRequest: editRequest,
        originalInput: {
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          interests: trip.formValues.interests, 
          budget: trip.formValues.budget,
          travelerType: trip.formValues.travelerType,
          travelPace: trip.formValues.travelPace,
          arrivalTime: trip.formValues.arrivalTime,
          departureTime: trip.formValues.departureTime,
          hotelName: trip.formValues.hotelName,
        }
      };
      
      const updatedItinerary = await editItinerary(input);

      const updatedTripData: TripData = {
        ...trip,
        itineraryData: updatedItinerary,
      };

      await updateTrip(trip.id, { itineraryData: updatedItinerary });
      setTrip(updatedTripData);

      toast({
        title: "Itinerario aggiornato!",
        description: "Le tue modifiche sono state applicate con successo.",
      });

    } catch (e) {
       toast({
        title: "Errore",
        description: "Non è stato possibile applicare le modifiche. Riprova.",
        variant: "destructive",
      });
      console.error(e);
    } finally {
      setIsEditing(false);
      setIsEditModalOpen(false);
      setEditRequest('');
    }
  };

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
    // This state can be reached if a trip is not found or after deletion.
    // We already show an error message if there's an error, so a simple message is enough here.
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8 text-center">
                <p>Caricamento viaggio o viaggio non trovato.</p>
                <Button onClick={() => router.push('/my-trips')} className="mt-6">Torna ai tuoi viaggi</Button>
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
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Modifica con AI</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifica il tuo itinerario</DialogTitle>
                          <DialogDescription>
                            Descrivi le modifiche che vorresti apportare. L'AI aggiornerà il tuo piano di viaggio.
                            Esempi: "Aggiungi un pomeriggio di relax in spa", "Sostituisci il museo con un'attività all'aperto".
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea 
                          placeholder="La tua richiesta..." 
                          value={editRequest}
                          onChange={(e) => setEditRequest(e.target.value)}
                          rows={4}
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Annulla</Button>
                          </DialogClose>
                          <Button onClick={handleEditRequest} disabled={isEditing || !editRequest}>
                            {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Applica Modifiche
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                                Elimina
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Questa azione non può essere annullata. L'itinerario verrà eliminato in modo permanente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Sì, elimina
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            {isEditing ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg shadow-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground font-headline">Sto aggiornando la tua avventura...</h2>
                <p className="text-muted-foreground">Applico le tue modifiche all'itinerario!</p>
              </div>
            ) : (
              <ItineraryDisplay 
                  itineraryData={trip.itineraryData} 
                  packingListData={trip.packingListData}
                  isSavedTrip={true}
                  formValues={trip.formValues}
              />
            )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
