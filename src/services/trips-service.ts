
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
    createdAt?: any; 
}

// This interface reflects how data is structured in Firestore, with dates as strings
interface TripDocument {
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    itineraryData: GenerateItineraryOutput;
    packingListData: GeneratePackingListOutput | null;
    formValues: {
        [key: string]: any; // Allows for flexible form values
        dates: {
            from: string;
            to: string;
        };
    } | null;
    createdAt: any;
}


/**
 * Converts a Firestore document into the TripData format for the app,
 * properly handling date conversions.
 * @param doc The Firestore document snapshot.
 * @returns A TripData object.
 */
function docToTripData(doc: any): TripData {
    const data = doc.data() as TripDocument;
    
    let formValues: ItineraryFormValues | null = null;
    if (data.formValues && data.formValues.dates) {
        formValues = {
            ...data.formValues,
            dates: {
                from: new Date(data.formValues.dates.from),
                to: new Date(data.formValues.dates.to)
            }
        } as ItineraryFormValues;
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
 * Saves a new trip to the database.
 * Converts Date objects in formValues to ISO strings for Firestore compatibility.
 */
export async function saveTrip(tripData: Omit<TripData, 'id' | 'createdAt'>): Promise<{ id: string }> {
  try {
    let dataToSave: Omit<TripDocument, 'createdAt'>;

    if (tripData.formValues) {
        const { dates, ...otherFormValues } = tripData.formValues;
        dataToSave = {
            ...tripData,
            formValues: {
                ...otherFormValues,
                dates: {
                    from: dates.from.toISOString(),
                    to: dates.to.toISOString(),
                }
            }
        };
    } else {
        dataToSave = {
            ...tripData,
            formValues: null,
        }
    }

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

/**
 * Retrieves all trips for a given user.
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
 * Retrieves a single trip by its ID.
 */
export async function getTripById(tripId: string): Promise<TripData | null> {
    try {
        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docToTripData(docSnap);
        } else {
            console.warn(`Trip with ID ${tripId} not found.`);
            return null;
        }
    } catch (error) {
        console.error("Errore nel recuperare il viaggio:", error);
        throw new Error("Impossibile recuperare il viaggio.");
    }
}


/**
 * Deletes a trip from the database.
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
 * Updates an existing trip in the database.
 * Handles date conversions for formValues if they are present.
 */
export async function updateTrip(tripId: string, updates: Partial<TripData>): Promise<void> {
    try {
        const docRef = doc(db, 'trips', tripId);
        
        let dataToUpdate: { [key: string]: any } = { ...updates };

        // Handle nested date object conversion if formValues are being updated
        if (updates.formValues && updates.formValues.dates) {
            const { dates, ...otherFormValues } = updates.formValues;
            dataToUpdate.formValues = {
                ...otherFormValues,
                 dates: {
                    from: dates.from.toISOString(),
                    to: dates.to.toISOString(),
                }
            };
        } else if (updates.formValues) {
             dataToUpdate.formValues = updates.formValues;
        }

        // Remove properties that shouldn't be in the final update object
        delete dataToUpdate.id;

        await updateDoc(docRef, dataToUpdate);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del viaggio:', error);
        throw new Error('Impossibile aggiornare il viaggio.');
    }
}
