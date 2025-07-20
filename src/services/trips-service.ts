'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import type { GenerateItineraryOutput } from '@/ai/flows/generate-itinerary';
import type { GeneratePackingListOutput } from '@/ai/flows/generate-packing-list';

export interface TripData {
    id?: string;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    itineraryData: GenerateItineraryOutput;
    packingListData: GeneratePackingListOutput | null;
    createdAt: any; 
}

/**
 * Salva un nuovo viaggio nel database.
 */
export async function saveTrip(tripData: Omit<TripData, 'id' | 'createdAt'>): Promise<{ id: string }> {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Errore durante il salvataggio del viaggio:', error);
    throw new Error('Impossibile salvare il viaggio.');
  }
}

/**
 * Recupera tutti i viaggi per un dato utente.
 */
export async function getTripsForUser(userId: string): Promise<TripData[]> {
    try {
        const q = query(collection(db, "trips"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const trips: TripData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            trips.push({
                id: doc.id,
                ...data,
                // Le date vengono convertite in stringhe ISO per essere serializzabili
                startDate: data.startDate,
                endDate: data.endDate,
                createdAt: data.createdAt?.toDate().toISOString(),
            } as TripData);
        });
        return trips;
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
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                 // Le date vengono convertite in stringhe ISO per essere serializzabili
                 startDate: data.startDate,
                 endDate: data.endDate,
                 createdAt: data.createdAt?.toDate().toISOString(),
            } as TripData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Errore nel recuperare il viaggio:", error);
        throw new Error("Impossibile recuperare il viaggio.");
    }
}
