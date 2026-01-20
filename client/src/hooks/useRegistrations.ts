import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Registration {
    id: string; // Firestore Doc ID
    eventId: string;
    userId: string;
    registeredAt: string;
    status: 'Registered' | 'Cancelled';
}

export function useUserRegistrations(userId?: string) {
    return useQuery({
        queryKey: ['registrations', userId],
        queryFn: async () => {
            if (!userId) return [];
            const q = query(
                collection(db, 'registrations'),
                where('userId', '==', userId),
                where('status', '==', 'Registered')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        },
        enabled: !!userId
    });
}

export function useEventRegistrations(eventId: string) {
    return useQuery({
        queryKey: ['event-registrations', eventId],
        queryFn: async () => {
            const q = query(
                collection(db, 'registrations'),
                where('eventId', '==', eventId),
                where('status', '==', 'Registered')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        }
    });
}

export function useRegisterForEvent() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error("User must be logged in");

            const newRegistration = {
                eventId,
                userId: user.id,
                registeredAt: new Date().toISOString(),
                status: 'Registered'
            };

            // Add to registrations collection
            await addDoc(collection(db, 'registrations'), newRegistration);

            // Optionally update event document's registered counter (if we use denormalizaton later)
            // For now, allow the count to be derived from collection query
        },
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] }); // If we display counts on cards
        }
    });
}

export function useUnregisterFromEvent() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (eventId: string) => {
            if (!user) throw new Error("User must be logged in");

            // Find the registration doc
            const q = query(
                collection(db, 'registrations'),
                where('userId', '==', user.id),
                where('eventId', '==', eventId),
                where('status', '==', 'Registered')
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docId = snapshot.docs[0].id;
                // We can either delete or update status. Let's update status to preserve history.
                await updateDoc(doc(db, 'registrations', docId), { status: 'Cancelled' });
            }
        },
        onSuccess: (_, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] });
        }
    });
}

export function useAllRegistrations() {
    return useQuery({
        queryKey: ['all-registrations'],
        queryFn: async () => {
            const snapshot = await getDocs(collection(db, 'registrations'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
        }
    });
}
