import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Phone, FileText } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();


  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setStudentId(user.studentId || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {

      if (user.role === 'student' && studentId && studentId.trim() !== '' && studentId !== user.studentId) {
        // Validate format
        if (!/^\d{13}$/.test(studentId)) {
          toast({
            title: "Invalid Student ID",
            description: "Student ID must be exactly 13 numeric digits.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Check uniqueness via Lookup Table
        // We check the specific document in the student_ids collection
        // This is allowed by security rules (public read for existence check)
        const studentIdRef = doc(db, 'student_ids', studentId);
        const studentIdDoc = await getDoc(studentIdRef);

        if (studentIdDoc.exists()) {
          toast({
            title: "Profile Update Failed",
            description: "This Student ID is already used by another account.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Check phone validation
      if (phone && phone.trim() !== '') {
        // Basic phone validation: allows +, -, spaces, and 10-15 digits
        if (!/^[+]?[\d\s-]{10,15}$/.test(phone)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid phone number (e.g., +880 1xxxxxxxxx).",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }

      // Start Batch Write
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.id);

      // 1. Update User Profile
      batch.update(userRef, {
        name,
        studentId,
        phone,
        bio
      });

      // 2. Manage Student ID Lookup (if changed)
      if (studentId !== user.studentId) {
        // If there was an old ID, remove it to free it up
        if (user.studentId) {
          const oldIdRef = doc(db, 'student_ids', user.studentId);
          batch.delete(oldIdRef);
        }

        // If there is a new ID, claim it
        if (studentId) {
          const newIdRef = doc(db, 'student_ids', studentId);
          batch.set(newIdRef, { uid: user.id });
        }
      }

      await batch.commit();

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <FloatingShapes />

        <div className="max-w-3xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl font-bold mb-4">
              Your <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass border-0 mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <Avatar className="w-32 h-32 border-4 border-primary/30">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-white">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>


                  <h2 className="font-display text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                        placeholder="Your full name"
                        data-testid="input-profile-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user?.email}
                        disabled
                        className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl opacity-60"
                      />
                    </div>
                  </div>

                  {user?.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground font-bold text-xs border border-muted-foreground rounded-sm">ID</div>
                        <Input
                          id="studentId"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="Enter your Student ID"
                          className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                          data-testid="input-profile-student-id"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                        placeholder="+880 1..."
                        data-testid="input-profile-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="pl-12 min-h-24 bg-background/50 border-border/50 rounded-xl resize-none"
                        placeholder="Tell us about yourself..."
                        data-testid="input-profile-bio"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 rounded-xl"
                    data-testid="button-save-profile"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
