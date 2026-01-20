import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    CheckCircle,
    Mail,
    AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Loading3D } from '@/components/ui/Loading3D';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    studentId?: string;
}

export default function SuperUserUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
            });
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to load users from database.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'All' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure? This will delete the user's profile from the database (Auth account remains).")) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(users.filter(u => u.id !== userId));
            toast({
                title: "User Deleted",
                description: "User profile has been removed.",
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive",
            });
        }
    };

    const handleChangeRole = async (userId: string, newRole: UserRole) => {
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast({
                title: "Role Updated",
                description: `User role has been changed to ${newRole}.`,
            });
        } catch (error) {
            console.error("Error updating role:", error);
            toast({
                title: "Error",
                description: "Failed to update user role.",
                variant: "destructive",
            });
        }
    };

    if (currentUser?.role !== 'super-user') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Only the Super User (System Owner) can access this page.
                </p>
                <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-left">
                    <p className="font-semibold mb-1">Current User:</p>
                    <p>Email: {currentUser?.email}</p>
                    <p>Role: <Badge variant="outline">{currentUser?.role || 'Guest'}</Badge></p>
                </div>
            </div>
        );
    }

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
                                User <span className="gradient-text">Management</span>
                            </h1>
                            <p className="text-muted-foreground">Manage students, admins, and permissions</p>
                        </div>
                        {/* "Add User" removed as sign-ups should be self-service or invite-only via auth flows */}
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
                                            placeholder="Search users by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 h-11 bg-background/50 border-border/50 rounded-xl"
                                        />
                                    </div>
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                        <SelectTrigger className="w-40 h-11 bg-background/50 border-border/50 rounded-xl">
                                            <Filter className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Filter Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Roles</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="super-user">Super User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass border-0">
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-8 flex justify-center"><Loading3D /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[300px]">User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                        No users found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={user.avatar} />
                                                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{user.name}</p>
                                                                    {user.role === 'super-user' && (
                                                                        <span className="text-xs text-primary font-medium">System Owner</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="secondary"
                                                                className={
                                                                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-600' :
                                                                        user.role === 'super-user' ? 'bg-red-500/20 text-red-600' :
                                                                            'bg-blue-500/20 text-blue-600'
                                                                }
                                                            >
                                                                {user.role}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-3 h-3" />
                                                                {user.email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {user.studentId ? (
                                                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">ID: {user.studentId}</span>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {/* Prevent deleting/demoting the LAST super user in a real app would be wise, but here just prevent self-action or action on super users if not authorized */}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" disabled={user.id === currentUser?.id}>
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 glass border-border">
                                                                    <div className="px-2 py-1.5">
                                                                        <p className="text-xs font-medium text-muted-foreground mb-2">Change Role</p>
                                                                        <div className="space-y-1">
                                                                            <Button
                                                                                variant={user.role === 'student' ? 'secondary' : 'ghost'}
                                                                                size="sm"
                                                                                className="w-full justify-start"
                                                                                onClick={() => handleChangeRole(user.id, 'student')}
                                                                            >
                                                                                Student
                                                                                {user.role === 'student' && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
                                                                            </Button>
                                                                            <Button
                                                                                variant={user.role === 'admin' ? 'secondary' : 'ghost'}
                                                                                size="sm"
                                                                                className="w-full justify-start"
                                                                                onClick={() => handleChangeRole(user.id, 'admin')}
                                                                            >
                                                                                Admin
                                                                                {user.role === 'admin' && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
                                                                            </Button>
                                                                            <Button
                                                                                variant={user.role === 'super-user' ? 'secondary' : 'ghost'}
                                                                                size="sm"
                                                                                className="w-full justify-start"
                                                                                onClick={() => handleChangeRole(user.id, 'super-user')}
                                                                            >
                                                                                Super User
                                                                                {user.role === 'super-user' && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                        onClick={() => handleDeleteUser(user.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Delete User
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
