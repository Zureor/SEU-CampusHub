import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useEvents, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useRegistration } from '@/contexts/RegistrationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

export default function AdminEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { data: events = [], isLoading } = useEvents(); // Fetch events
  const { getRegistrationCount } = useRegistration();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleEventStatus = (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    updateEvent.mutate({ id: eventId, data: { status: newStatus as 'Draft' | 'Published' } }, {
      onSuccess: () => {
        toast({
          title: newStatus === 'Published' ? "Event Published" : "Event Unpublished",
          description: `Event status has been updated.`,
        });
      }
    });
  };

  const handleDelete = (eventId: string) => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => {
        toast({
          title: "Event Deleted",
          description: "The event has been removed.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingShapes />

        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                Manage <span className="gradient-text">Events</span>
              </h1>
              <p className="text-muted-foreground">Create, edit, and manage all campus events</p>
            </div>
            <Link href="/admin/events/create">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0" data-testid="button-create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-0 mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-11 bg-background/50 border-border/50 rounded-xl"
                      data-testid="input-search-events"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 h-11 bg-background/50 border-border/50 rounded-xl">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold">
                          Event
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="gap-1 font-semibold">
                          Date
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton rows - prevents flash of "No Events" message
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                              <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-10 bg-muted rounded-full animate-pulse" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No events found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={event.bannerUrl}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium truncate max-w-[200px]">{event.title}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {event.venue}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {event.capacity ? (
                              <span>{getRegistrationCount(event.id)} / {event.capacity}</span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={event.status === 'Published'}
                              onCheckedChange={() => toggleEventStatus(event.id, event.status)}
                              data-testid={`switch-publish-${event.id}`}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-event-actions-${event.id}`}>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/event/${event.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                </Link>
                                {event.registrationRequired && (
                                  <Link href={`/admin/events/${event.id}/registrations`}>
                                    <DropdownMenuItem>
                                      <Users className="w-4 h-4 mr-2" />
                                      View Registrations
                                    </DropdownMenuItem>
                                  </Link>
                                )}
                                <Link href={`/admin/events/edit/${event.id}`}>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(event.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  <span className="inline-block h-4 w-32 bg-muted rounded animate-pulse" />
                ) : (
                  `Showing ${filteredEvents.length} of ${events.length} events`
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
