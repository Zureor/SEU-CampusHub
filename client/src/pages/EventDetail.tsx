import { useParams, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ExternalLink,
  Building,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  Heart
} from 'lucide-react';
import { Loading3D } from '@/components/ui/Loading3D';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistration } from '@/contexts/RegistrationContext';
import { useInterestedEvents } from '@/contexts/InterestedEventsContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const typeColors: Record<string, string> = {
  Cultural: 'from-purple-500 to-pink-500',
  Academic: 'from-blue-500 to-cyan-500',
  Sports: 'from-green-500 to-emerald-500',
  Workshop: 'from-orange-500 to-amber-500',
  Scholarship: 'from-yellow-500 to-orange-500',
  Club: 'from-indigo-500 to-purple-500',
};

export default function EventDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isRegistered, registerForEvent, unregisterFromEvent, getRegistrationCount } = useRegistration();
  const { isInterested, toggleInterested } = useInterestedEvents();
  const { toast } = useToast();
  const { data: event, isLoading: isLoadingEvent } = useEvent(id || '');
  const [isLoading, setIsLoading] = useState(false);



  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loading3D />
        </div>
      </div>
    );
  }

  const eventIsInterested = id ? isInterested(id) : false;
  const userIsRegistered = id ? isRegistered(id) : false;
  // Use getRegistrationCount for real-time accuracy instead of event.registered
  const dynamicRegisteredCount = id ? getRegistrationCount(id) : 0;
  const isEventPast = event ? new Date(event.date) < new Date() : false;

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const registrationProgress = event.capacity
    ? (dynamicRegisteredCount / event.capacity) * 100
    : 0;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to register for events.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (user?.role === 'student' && (!user.studentId || user.studentId.trim() === '')) {
      toast({
        title: "Student ID Required",
        description: "Please add your Student ID in your profile to register for events.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      await registerForEvent(id);
      toast({
        title: "Successfully Registered!",
        description: `You're now registered for ${event.title}.`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      await unregisterFromEvent(id);
      toast({
        title: "Registration Cancelled",
        description: `You've unregistered from ${event.title}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not cancel registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on CampusHub!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Event link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative flex-grow">
        <div className="h-[50vh] relative overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

          <div className="absolute top-28 left-8 z-10">
            <Button
              variant="outline"
              className="glass border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/events')}
              data-testid="button-back-to-events"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>

          <div className="absolute top-28 right-8 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={async () => {
                if (!isAuthenticated) {
                  toast({ title: "Login Required", description: "Please log in to mark events as interested.", variant: "destructive" });
                  navigate('/login');
                  return;
                }
                try {
                  await toggleInterested(id || '');
                  toast({ title: eventIsInterested ? "Removed" : "Interested", description: eventIsInterested ? "Removed from interested events." : "Added to interested events." });
                } catch (e) {
                  toast({ title: "Error", variant: "destructive" });
                }
              }}
              className="p-3 rounded-full glass backdrop-blur-md"
              data-testid="button-interest-event"
            >
              {eventIsInterested ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5 text-white" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 rounded-full glass backdrop-blur-md"
              data-testid="button-share-event"
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8"
              >
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="px-4 py-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {event.category}
                  </Badge>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6" data-testid="text-event-title">
                  {event.title}
                </h1>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-medium text-foreground">{event.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Organizer</p>
                      <p className="font-medium text-foreground">{event.organizer}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div>
                  <h2 className="font-display text-2xl font-bold mb-4">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-event-description">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-6 sticky top-28"
              >
                {event.registrationRequired && event.capacity && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">{dynamicRegisteredCount} / {event.capacity}</span>
                    </div>
                    <Progress value={registrationProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {event.capacity - dynamicRegisteredCount} spots remaining
                    </p>
                  </div>
                )}

                {isAuthenticated && userIsRegistered && (
                  <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="font-medium text-green-600 dark:text-green-400">You're Registered!</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {event.registrationRequired && (
                    <>
                      {userIsRegistered && !isEventPast ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-12 text-lg rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                              disabled={isLoading}
                              data-testid="button-unregister-event"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Cancel Registration
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your registration for "{event.title}"?
                                You may not be able to register again if the event fills up.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleUnregister}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : userIsRegistered && isEventPast ? (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-lg rounded-xl border-muted text-muted-foreground"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Event Attended
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0 h-12 text-lg rounded-xl glow"
                          onClick={handleRegister}
                          disabled={isLoading || isEventPast}
                          data-testid="button-register-event"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                          )}
                          {isEventPast ? 'Event Ended' : 'Register Now'}
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl glass border-primary/30 hover:bg-primary/10"
                    onClick={async () => {
                      if (!isAuthenticated) {
                        toast({ title: "Login Required", description: "Please log in to mark events as interested.", variant: "destructive" });
                        navigate('/login');
                        return;
                      }
                      try {
                        await toggleInterested(id || '');
                        toast({ title: eventIsInterested ? "Removed" : "Interested", description: eventIsInterested ? "Removed from interested events." : "Added to interested events." });
                      } catch (e) {
                        toast({ title: "Error", variant: "destructive" });
                      }
                    }}
                    data-testid="button-interest"
                  >
                    {eventIsInterested ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                        Interested
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 mr-2" />
                        Mark as Interested
                      </>
                    )}
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center gap-4">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 border-2 border-background"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    +{event.interestedCount || 0} interested
                  </span>
                </div>


              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
