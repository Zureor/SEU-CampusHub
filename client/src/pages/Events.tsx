import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Search, Filter, X, Calendar, Grid, List, MapPin, Clock, Heart, Eye } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { useInterestedEvents } from '@/contexts/InterestedEventsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistration } from '@/contexts/RegistrationContext';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types';

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



export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: events = [], isLoading } = useEvents();
  const { data: categories = [] } = useCategories();
  const { isAuthenticated } = useAuth();
  const { isInterested, toggleInterested } = useInterestedEvents();
  const { getRegistrationCount } = useRegistration();
  const { toast } = useToast();

  const publishedEvents = events.filter(e => e.status === 'Published');

  const filteredEvents = publishedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'popularity') {
      return (getRegistrationCount(b.id) || 0) - (getRegistrationCount(a.id) || 0);
    }
    return 0;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleToggleInterested = async (e: React.MouseEvent, eventId: string, eventTitle: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to mark events as interested.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wasInterested = isInterested(eventId);
      await toggleInterested(eventId);
      toast({
        title: wasInterested ? "Removed" : "Interested!",
        description: wasInterested
          ? `"${eventTitle}" removed from interested.`
          : `"${eventTitle}" added to interested!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update interested events.",
        variant: "destructive",
      });
    }
  };

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
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              All <span className="gradient-text">Events</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Discover and register for campus events that match your interests
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                  data-testid="input-search-events"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 h-12 bg-background/50 border-border/50 rounded-xl" data-testid="select-category">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-12 bg-background/50 border-border/50 rounded-xl" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-xl overflow-hidden border border-border/50">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-none h-12 w-12"
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-none h-12 w-12"
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {selectedCategory}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                  Clear all
                </Button>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{sortedEvents.length}</span> events
            </p>
          </div>

          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : sortedEvents.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((event, index) => {
                  const isEventPast = new Date(event.date) < new Date();
                  const eventIsInterested = isInterested(event.id);


                  const category = categories.find(c => c.name === event.category);
                  const gradientColor = category?.color || 'from-gray-500 to-gray-600';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link href={`/event/${event.id}`}>
                        <div className={`glass rounded-xl p-4 hover:bg-primary/5 transition-all cursor-pointer group ${isEventPast ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <img
                              src={event.bannerUrl}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                            />

                            {/* Title & Description */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">{event.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {event.description.slice(0, 60)}...
                              </p>
                            </div>

                            {/* Date & Time */}
                            <div className="hidden md:block text-sm text-muted-foreground min-w-[100px]">
                              <p>{formatDate(event.date)}</p>
                              <p className="text-xs">{event.time}</p>
                            </div>

                            {/* Category */}
                            <Badge
                              className={`hidden sm:inline-flex bg-gradient-to-r ${gradientColor} text-white border-0`}
                            >
                              {event.category}
                            </Badge>

                            {/* Venue */}
                            <p className="hidden lg:block text-sm text-muted-foreground truncate max-w-[120px]">
                              {event.venue}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => handleToggleInterested(e, event.id, event.title)}
                              >
                                <Heart
                                  className={`w-4 h-4 ${eventIsInterested ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                                />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
              <Button onClick={clearFilters} variant="outline" data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
