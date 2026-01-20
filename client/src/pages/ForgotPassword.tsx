import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSent(true);
            toast({
                title: "Reset Link Sent",
                description: "Check your email for instructions to reset your password.",
            });
        } catch (error: any) {
            console.error(error);
            let errorMessage = "Failed to send reset email. Please try again.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email address.";
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="relative z-10 w-full max-w-md mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-3xl p-8"
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow"
                            >
                                <span className="text-white font-bold text-2xl font-display">?</span>
                            </motion.div>
                            <h1 className="font-display text-3xl font-bold mb-2">Forgot Password</h1>
                            <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
                        </div>

                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@campus.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                                            required
                                            data-testid="input-email-reset"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 rounded-xl text-lg"
                                    data-testid="button-reset-submit"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="bg-primary/10 p-4 rounded-xl text-primary border border-primary/20">
                                    Reset link sent to <span className="font-bold">{email}</span>. Please check your inbox (and spam folder).
                                </div>
                                <Button
                                    onClick={() => setIsSent(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Try another email
                                </Button>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <Link href="/login">
                                <span className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </span>
                            </Link>
                        </div>

                    </motion.div>
                </div>
            </section>
        </div>
    );
}
