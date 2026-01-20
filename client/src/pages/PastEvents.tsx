import { motion } from 'framer-motion';
import { Calendar, History } from 'lucide-react';
import { Link } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { EventCard } from '@/components/events/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';

export default function PastEvents() {
    const { getUserRegistrations } = useRegistration();
    const { data: events = [], isLoading } = useEvents();

    const userRegistrations = getUserRegistrations();
    const registeredEventIds = userRegistrations.map(r => r.eventId);
    const registeredEvents = events.filter(e => registeredEventIds.includes(e.id));

    const pastRegistered = registeredEvents.filter(e => new Date(e.date) < new Date());

    // Skeleton card component for loading state
    const SkeletonCard = () => (
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="h-48 bg-muted animate-pulse" />
            <div className="p-5 space-y-3">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="flex gap-2 pt-2">
                    <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
                    <div className="h-8 w-20 bg-muted rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative pt-32 pb-20 overflow-hidden flex-grow">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-7xl mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow">
                            <History className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
                            Past <span className="gradient-text">Events</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Events you've attended
                        </p>
                    </motion.div>

                    {isLoading ? (
                        // Loading skeleton grid
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCard key={`skeleton-${index}`} />
                            ))}
                        </div>
                    ) : pastRegistered.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastRegistered.map((event, index) => (
                                <EventCard key={event.id} event={event} index={index} />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-display text-2xl font-bold mb-2">No Past Events</h3>
                            <p className="text-muted-foreground mb-6">You haven't attended any events yet.</p>
                            <Link href="/events">
                                <Button className="bg-gradient-to-r from-primary to-accent text-white border-0">
                                    Browse Events
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}

