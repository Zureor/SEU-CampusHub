import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { EventCard } from '@/components/events/EventCard';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useInterestedEvents } from '@/contexts/InterestedEventsContext';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

export default function InterestedEvents() {
    const { interestedEventIds, isLoading: isLoadingInterested } = useInterestedEvents();
    const { data: allEvents = [], isLoading: isLoadingEvents } = useEvents();

    const interestedEventsList = allEvents.filter(event =>
        interestedEventIds.includes(event.id)
    );

    const isLoading = isLoadingInterested || isLoadingEvents;

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
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center glow">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
                            Interested <span className="gradient-text">Events</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Events you've marked as interested in
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
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
                            ))}
                        </div>
                    ) : interestedEventsList.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interestedEventsList.map((event, index) => (
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
                                <Heart className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="font-display text-2xl font-bold mb-2">No Interested Events</h3>
                            <p className="text-muted-foreground mb-6">Browse events and click the heart icon to mark ones you're interested in!</p>
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
