
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import type { GeneratePackingListOutput } from '@/ai/flows/generate-packing-list';
import type { ItineraryFormValues } from '@/components/itinerary-form';

export interface TripData {
    id?: string;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    itineraryData: GenerateItineraryOutput;
    packingListData: GeneratePackingListOutput | null;
    formValues: ItineraryFormValues | null;
    createdAt: any; 
}

// Interface for how trip data is stored in Firestore
interface TripDocument {
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    itineraryData: GenerateItineraryOutput;
    packingListData: GeneratePackingListOutput | null;
    formValues: Omit<ItineraryFormValues, 'dates'> & {
        dates: {
            from: string;
            to: string;
        }
    } | null;
    createdAt: any;
}


/**
 * Salva un nuovo viaggio nel database.
 */
export async function saveTrip(tripData: Omit<TripData, 'id' | 'createdAt'>): Promise<{ id: string }> {
  try {
    const dataToSave: Omit<TripDocument, 'createdAt'> = {
        ...tripData,
        formValues: tripData.formValues ? {
            ...tripData.formValues,
            dates: {
                from: tripData.formValues.dates.from.toISOString(),
                to: tripData.formValues.dates.to.toISOString(),
            }
        } : null
    };

    const docRef = await addDoc(collection(db, 'trips'), {
      ...dataToSave,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Errore durante il salvataggio del viaggio:', error);
    throw new Error('Impossibile salvare il viaggio.');
  }
}

function docToTripData(doc: any): TripData {
    const data = doc.data() as TripDocument;
    
    let formValues: ItineraryFormValues | null = null;
    if (data.formValues) {
        formValues = {
            ...data.formValues,
            dates: {
                from: new Date(data.formValues.dates.from),
                to: new Date(data.formValues.dates.to)
            }
        };
    }

    return {
        id: doc.id,
        userId: data.userId,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        itineraryData: data.itineraryData,
        packingListData: data.packingListData,
        formValues: formValues,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
}


/**
 * Recupera tutti i viaggi per un dato utente.
 */
export async function getTripsForUser(userId: string): Promise<TripData[]> {
    try {
        const q = query(collection(db, "trips"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToTripData);
    } catch (error) {
        console.error("Errore nel recuperare i viaggi:", error);
        throw new Error("Impossibile recuperare i viaggi.");
    }
}

/**
 * Recupera un singolo viaggio tramite il suo ID.
 */
export async function getTripById(tripId: string): Promise<TripData | null> {
    try {
        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docToTripData(docSnap);
        } else {
            return null;
        }
    } catch (error) {
        console.error("Errore nel recuperare il viaggio:", error);
        throw new Error("Impossibile recuperare il viaggio.");
    }
}


/**
 * Elimina un viaggio dal database.
 */
export async function deleteTrip(tripId: string): Promise<void> {
    try {
        const docRef = doc(db, 'trips', tripId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Errore durante l\'eliminazione del viaggio:', error);
        throw new Error('Impossibile eliminare il viaggio.');
    }
}

/**
 * Aggiorna un viaggio esistente nel database.
 */
export async function updateTrip(tripId: string, updates: Partial<TripData>): Promise<void> {
    try {
        const docRef = doc(db, 'trips', tripId);
        
        let dataToUpdate: Partial<TripDocument> = { ...updates };

        if (updates.formValues) {
            dataToUpdate.formValues = {
                ...updates.formValues,
                 dates: {
                    from: updates.formValues.dates.from.toISOString(),
                    to: updates.formValues.dates.to.toISOString(),
                }
            };
        }
        
        await updateDoc(docRef, dataToUpdate);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del viaggio:', error);
        throw new Error('Impossibile aggiornare il viaggio.');
    }
}
