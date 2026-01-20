import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,

  Loader2,
  RefreshCw,
  Heart,
  ClipboardCheck
} from 'lucide-react';
import { Loading3D } from '@/components/ui/Loading3D';
import { useState } from 'react';
import { collection, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';


import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { useUsers } from '@/hooks/useUsers';
import { useAllRegistrations } from '@/hooks/useRegistrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: events = [], isLoading: isLoadingEvents } = useEvents();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const { data: registrations = [], isLoading: isLoadingRegistrations } = useAllRegistrations();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncStats = async () => {
    if (!confirm("This will recalculate all event statistics from the database. Continue?")) return;
    setIsSyncing(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const eventsSnap = await getDocs(collection(db, 'events'));

      const interestCounts: Record<string, number> = {};

      usersSnap.forEach(doc => {
        const data = doc.data();
        const interested = data.interestedEvents || [];
        interested.forEach((eventId: string) => {
          interestCounts[eventId] = (interestCounts[eventId] || 0) + 1;
        });
      });

      const batch = writeBatch(db);

      eventsSnap.forEach(doc => {
        const eventId = doc.id;
        const actualCount = interestCounts[eventId] || 0;
        batch.update(doc.ref, { interestedCount: actualCount });
      });

      await batch.commit();
      toast({ title: "Stats Synced", description: "Event interest counts updated." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to sync stats.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncStudentIds = async () => {
    if (!confirm("This will populate the Student ID lookup table for ALL existing users. Use this once to fix validation for old accounts.")) return;
    setIsSyncing(true);
    try {
      const { doc } = await import('firebase/firestore');

      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let count = 0;

      usersSnap.forEach(userDoc => {
        const userData = userDoc.data();
        if (userData.studentId) {
          const ref = doc(db, 'student_ids', userData.studentId);
          batch.set(ref, { uid: userDoc.id });
          count++;
        }
      });

      await batch.commit();
      toast({ title: "Student IDs Synced", description: `Updated lookup table for ${count} users.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to sync Student IDs.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCleanupDuplicateRegistrations = async () => {
    if (!confirm("This will remove duplicate registrations AND recalculate all event registration counts from the database. Proceed?")) return;
    setIsSyncing(true);
    try {
      const { deleteDoc, doc, updateDoc, writeBatch } = await import('firebase/firestore');

      // 1. Fetch all registrations
      const regsSnap = await getDocs(collection(db, 'registrations'));

      // Map: EventID -> Map<UserID, Array<Registration>>
      const eventUserRegs = new Map<string, Map<string, { id: string, registeredAt: any }[]>>();

      regsSnap.forEach(docSnap => {
        const data = docSnap.data();
        const eventId = data.eventId;
        const userId = data.userId;

        if (!eventId || !userId) return;

        if (!eventUserRegs.has(eventId)) {
          eventUserRegs.set(eventId, new Map());
        }

        const userMap = eventUserRegs.get(eventId)!;
        if (!userMap.has(userId)) {
          userMap.set(userId, []);
        }

        userMap.get(userId)!.push({
          id: docSnap.id,
          registeredAt: data.registeredAt
        });
      });

      let deletedCount = 0;
      const eventCounts: Record<string, number> = {};

      // 2. Process duplicates & count valid registrations
      for (const [eventId, userMap] of Array.from(eventUserRegs.entries())) {
        let validUserCount = 0;

        for (const [userId, regs] of Array.from(userMap.entries())) {
          // If user has > 1 registration, delete older ones
          if (regs.length > 1) {
            // Sort: Newest first
            regs.sort((a: any, b: any) => {
              const aTime = a.registeredAt?.toDate?.()?.getTime() || 0;
              const bTime = b.registeredAt?.toDate?.()?.getTime() || 0;
              return bTime - aTime;
            });

            // Keep index 0, delete others
            for (let i = 1; i < regs.length; i++) {
              await deleteDoc(doc(db, 'registrations', regs[i].id));
              deletedCount++;
            }
          }
          validUserCount++;
        }
        eventCounts[eventId] = validUserCount;
      }

      // 3. Update ALL events with correct counts
      const eventsSnap = await getDocs(collection(db, 'events'));
      const batch = writeBatch(db);
      let batchCount = 0;

      eventsSnap.forEach(eventDoc => {
        const eventId = eventDoc.id;
        const actualCount = eventCounts[eventId] || 0; // 0 if no registrations found
        const currentCount = eventDoc.data().registered || 0;

        if (actualCount !== currentCount) {
          batch.update(eventDoc.ref, { registered: actualCount });
          batchCount++;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }

      toast({ title: "Cleanup Complete", description: `Removed ${deletedCount} duplicates. Updated counts for ${batchCount} events.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to cleanup duplicates.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };
  const recentEvents = events.slice(0, 5);
  const publishedCount = events.filter(e => e.status === 'Published').length;
  const draftCount = events.filter(e => e.status === 'Draft').length;
  const totalInterests = events.reduce((acc, curr) => acc + (curr.interestedCount || 0), 0);

  const stats = [
    { icon: Calendar, value: events.length.toString(), label: 'Total Events', change: null, color: 'from-purple-500 to-pink-500', isLoading: isLoadingEvents },
    { icon: Users, value: users.length.toString(), label: 'Total Users', change: null, color: 'from-blue-500 to-cyan-500', isLoading: isLoadingUsers },
    { icon: ClipboardCheck, value: registrations.length.toString(), label: 'Total Registrations', change: null, color: 'from-green-500 to-emerald-500', isLoading: isLoadingRegistrations },
    { icon: Heart, value: totalInterests.toString(), label: 'Total Interests', change: null, color: 'from-orange-500 to-amber-500', isLoading: isLoadingEvents },
  ];

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
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage events, categories, and users</p>
            </div>
            <Link href="/admin/events/create">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0" data-testid="button-create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass border-0">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      {stat.change && (
                        <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                    {stat.isLoading ? (
                      <div className="h-9 w-16 bg-muted rounded animate-pulse mb-1" />
                    ) : (
                      <div className="font-display text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    )}
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="glass border-0">
                <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                  <CardTitle className="font-display text-lg md:text-2xl">Recent Events</CardTitle>
                  <Link href="/admin/events">
                    <Button variant="ghost" size="sm" className="text-primary">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="hidden xs:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingEvents ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell className="hidden xs:table-cell">
                              <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : recentEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={event.bannerUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <span className="font-medium truncate max-w-[120px] md:max-w-[200px]">{event.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{event.category}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden sm:table-cell">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="hidden xs:table-cell">
                            <Badge className={event.status === 'Published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                              {event.status}
                            </Badge>
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
                                    View
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/admin/events/edit/${event.id}`}>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Event Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Published</span>
                    </div>
                    {isLoadingEvents ? (
                      <div className="h-5 w-8 bg-muted rounded animate-pulse" />
                    ) : (
                      <span className="font-semibold">{publishedCount}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Draft</span>
                    </div>
                    {isLoadingEvents ? (
                      <div className="h-5 w-8 bg-muted rounded animate-pulse" />
                    ) : (
                      <span className="font-semibold">{draftCount}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingCategories ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={`cat-skeleton-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-8 bg-muted rounded-full animate-pulse" />
                      </div>
                    ))
                  ) : (
                    categories.slice(0, 4).map(category => (
                      <div key={category.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} opacity-80 shrink-0`} />
                          <span className="truncate">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {events.filter(e => e.category === category.name).length}
                        </Badge>
                      </div>
                    ))
                  )}
                  <Link href="/admin/categories">
                    <Button variant="ghost" className="w-full mt-2" size="sm">
                      Manage Categories
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/admin/events/create">
                    <Button variant="outline" className="w-full justify-start glass border-border/50">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/admin/events">
                    <Button variant="outline" className="w-full justify-start glass border-border/50">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link href="/admin/categories">
                    <Button variant="outline" className="w-full justify-start glass border-border/50">
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Categories
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full justify-start glass border-border/50 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                    onClick={handleSyncStats}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Event Stats
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start glass border-border/50 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                    onClick={handleSyncStudentIds}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ClipboardCheck className="w-4 h-4 mr-2" />}
                    Sync Student IDs
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start glass border-border/50 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={handleCleanupDuplicateRegistrations}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Cleanup Duplicate Registrations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div >
      </section >
    </div >
  );
}
