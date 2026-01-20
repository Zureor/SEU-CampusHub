import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Calendar,
  Bookmark,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { EventCard } from '@/components/events/EventCard';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistration } from '@/contexts/RegistrationContext';
import { useInterestedEvents } from '@/contexts/InterestedEventsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserRegistrations } = useRegistration();
  const { interestedEventIds } = useInterestedEvents();
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();

  const userRegistrations = getUserRegistrations();
  const registeredEventIds = userRegistrations.map(r => r.eventId);
  const registeredEvents = events.filter(e => registeredEventIds.includes(e.id));

  const upcomingRegistered = registeredEvents.filter(e => new Date(e.date) >= new Date());
  const pastRegistered = registeredEvents.filter(e => new Date(e.date) < new Date());
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthCount = registeredEvents.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthCount = registeredEvents.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }).length;

  const stats = [
    { icon: Calendar, value: String(pastRegistered.length), label: 'Events Attended', color: 'from-purple-500 to-pink-500', href: '/past-events' },
    { icon: Bookmark, value: String(interestedEventIds.length), label: 'Interested', color: 'from-blue-500 to-cyan-500', href: '/interested-events' },
    { icon: CheckCircle, value: String(upcomingRegistered.length), label: 'Registered', color: 'from-green-500 to-emerald-500', href: '/my-registrations' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden flex-grow">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingShapes />

        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 mb-8"
          >
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left gap-6">
              <Avatar className="w-20 h-20 ring-4 ring-primary/30">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening on campus this week
                </p>
              </div>
            </div>
          </motion.div>

          {/* ... existing detailed stats ... */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={stat.href}>
                  <SpotlightCard className="border-0 cursor-pointer hover:scale-[1.02] transition-transform">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-display text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Registered Events</h2>
                  <Link href="/my-registrations">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {isLoadingEvents ? (
                  // Loading skeleton for registered events
                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={`reg-skeleton-${index}`} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                        <div className="h-48 bg-muted animate-pulse" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingRegistered.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingRegistered.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <Card className="glass border-0">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-display text-xl font-bold mb-2">No Upcoming Events</h3>
                      <p className="text-muted-foreground mb-4">You haven't registered for any upcoming events.</p>
                      <Link href="/events">
                        <Button className="bg-gradient-to-r from-primary to-accent text-white border-0">
                          Browse Events
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Upcoming Events</h2>
                  <Link href="/upcoming-events">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {isLoadingEvents ? (
                    // Loading skeleton for upcoming events
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`upcoming-skeleton-${index}`} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                        <div className="h-48 bg-muted animate-pulse" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))
                  ) : (
                    upcomingEvents.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))
                  )}
                </div>
              </motion.div>

              {pastRegistered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold">Past Events</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pastRegistered.map((event, index) => (
                      <EventCard key={event.id} event={event} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-semibold">{thisMonthCount} events</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Month</span>
                    <span className="font-semibold">{lastMonthCount} events</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{registeredEvents.length} events</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/events">
                    <Button variant="outline" className="w-full justify-start glass border-border/50">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start glass border-border/50">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
