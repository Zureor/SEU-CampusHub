import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    Timestamp,
    doc,
    updateDoc,
    getDocs,
    getDoc,
    increment
} from 'firebase/firestore';

interface Registration {
    id: string; // Firestore Doc ID
    eventId: string;
    userId: string;
    registeredAt: string;
    status: 'Registered' | 'Cancelled';
    userName?: string;
    userEmail?: string;
    studentId?: string;
}

interface RegistrationContextType {
    registrations: Registration[];
    isRegistered: (eventId: string) => boolean;
    registerForEvent: (eventId: string) => Promise<void>;
    unregisterFromEvent: (eventId: string) => Promise<void>;
    getRegistrationCount: (eventId: string) => number;
    getUserRegistrations: () => Registration[];
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Listen to ALL registrations to maintain counts and status
        // In a large app, you'd probably only fetch what's needed or use aggregation queries
        // But for this scale, listening to registrations is okay.
        // Optimization: Maybe only listen to current user's registrations + counts?
        // For simplicity: Listening to the 'registrations' collection.

        const q = query(collection(db, "registrations"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const regs: Registration[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                regs.push({
                    id: doc.id,
                    eventId: data.eventId,
                    userId: data.userId,
                    registeredAt: data.registeredAt?.toDate?.().toISOString() || new Date().toISOString(),
                    status: data.status,
                    userName: data.userName,
                    userEmail: data.userEmail,
                    studentId: data.studentId
                });
            });
            setRegistrations(regs);
        });

        return () => unsubscribe();
    }, []);

    const isRegistered = (eventId: string): boolean => {
        if (!user) return false;
        return registrations.some(
            r => r.eventId === eventId && r.userId === user.id && r.status === 'Registered'
        );
    };

    const registerForEvent = async (eventId: string): Promise<void> => {
        if (!user) throw new Error('Must be logged in to register');

        if (isRegistered(eventId)) {
            throw new Error('Already registered for this event');
        }

        // Check Access & Capacity
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) throw new Error('Event not found');

        const eventData = eventDoc.data();
        // Use local count if available for faster check, but source of truth is DB
        const currentRegistered = eventData.registered || 0;
        const capacity = eventData.capacity;

        if (capacity && currentRegistered >= capacity) {
            throw new Error('Event is fully booked');
        }

        // check if there is a cancelled registration to reactivate
        const existingRegistration = registrations.find(
            r => r.eventId === eventId && r.userId === user.id && r.status === 'Cancelled'
        );

        if (existingRegistration) {
            await updateDoc(doc(db, "registrations", existingRegistration.id), {
                status: 'Registered',
                registeredAt: Timestamp.now()
            });
        } else {
            await addDoc(collection(db, "registrations"), {
                eventId,
                userId: user.id,
                registeredAt: Timestamp.now(),
                status: 'Registered',
                userEmail: user.email,
                userName: user.name,
                studentId: user.studentId || 'N/A'
            });
        }

        // Update Event Count
        await updateDoc(eventRef, {
            registered: increment(1)
        });

        // Invalidate both event list and specific event details
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    };

    const unregisterFromEvent = async (eventId: string): Promise<void> => {
        if (!user) throw new Error('Must be logged in');

        const registration = registrations.find(
            r => r.eventId === eventId && r.userId === user.id && r.status === 'Registered'
        );

        if (registration) {
            await updateDoc(doc(db, "registrations", registration.id), {
                status: 'Cancelled'
            });

            // Decrease Event Count
            await updateDoc(doc(db, 'events', eventId), {
                registered: increment(-1)
            });

            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        }
    };

    const getRegistrationCount = (eventId: string): number => {
        return registrations.filter(
            r => r.eventId === eventId && r.status === 'Registered'
        ).length;
    };

    const getUserRegistrations = (): Registration[] => {
        if (!user) return [];
        return registrations.filter(r => r.userId === user.id && r.status === 'Registered');
    };

    return (
        <RegistrationContext.Provider
            value={{
                registrations,
                isRegistered,
                registerForEvent,
                unregisterFromEvent,
                getRegistrationCount,
                getUserRegistrations,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error('useRegistration must be used within a RegistrationProvider');
    }
    return context;
}
