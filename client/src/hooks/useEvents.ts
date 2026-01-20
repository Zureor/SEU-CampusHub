import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types';

export function useEvents() {
    return useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const q = query(collection(db, 'events'), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            // Map Firestore docs to Event interface
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        }
    });
}

export function useEvent(id: string) {
    return useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const docRef = doc(db, 'events', id);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) throw new Error('Event not found');
            return { id: snapshot.id, ...snapshot.data() } as Event;
        },
        enabled: !!id
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newEvent: Omit<Event, 'id'>) => {
            const docRef = await addDoc(collection(db, 'events'), newEvent);
            return { id: docRef.id, ...newEvent };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        }
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
            const docRef = doc(db, 'events', id);
            await updateDoc(docRef, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        }
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const docRef = doc(db, 'events', id);
            await deleteDoc(docRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        }
    });
}
