import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />

            <section className="relative pt-32 pb-20 flex-grow overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <FloatingShapes />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Privacy <span className="gradient-text">Policy</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            We value your trust and are committed to protecting your personal information.
                            This policy outlines how SEU CampusHub collects, uses, and safeguards your data.
                        </p>
                        <p className="text-sm text-primary/80 mt-4 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-0 overflow-hidden shadow-2xl">
                            <ScrollArea className="h-[600px] w-full rounded-md border p-0">
                                <CardContent className="p-8 md:p-12 space-y-10">
                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">1</span>
                                            Information We Collect
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            To provide you with a seamless experience on SEU CampusHub, we may collect the following types of information:
                                        </p>
                                        <ul className="list-none space-y-3 pl-2">
                                            <li className="flex items-start gap-3 text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                                <span><strong>Personal Information:</strong> Name, Southeast University email address, Student ID, and contact details provided during registration.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                                <span><strong>Usage Data:</strong> Information about how you interact with our platform, including event registrations, page views, and device information.</span>
                                            </li>
                                        </ul>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">2</span>
                                            How We Use Your Data
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            We utilize your information strictly to enhance your campus experience:
                                        </p>
                                        <ul className="list-none space-y-3 pl-2">
                                            {[
                                                'Facilitate event registrations and attendance tracking.',
                                                'Send important notifications regarding campus updates and event schedules.',
                                                'Analyze platform usage to improve features and user interface.',
                                                'Ensure the security and integrity of our community platform.'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">3</span>
                                            Data Protection
                                        </h2>
                                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                            <p className="text-muted-foreground leading-relaxed">
                                                We implement industry-standard security measures to prevent unauthorized access, disclosure, or alteration of your personal data.
                                                Your information is stored on secure servers with restricted access.
                                            </p>
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">4</span>
                                            Third-Party Disclosure
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We do not sell, trade, or otherwise transfer your personal information to outside parties.
                                            This does not include trusted third parties who assist us in operating our platform, conducting our business, or serving you,
                                            so long as those parties agree to keep this information confidential.
                                        </p>
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3 text-primary">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm">5</span>
                                            Contact Us
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            If you have any questions or concerns regarding this Privacy Policy, please reach out to our support team.
                                        </p>
                                        <a href="mailto:ev1shoaib@gmail.com" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                                            ev1shoaib@gmail.com
                                        </a>
                                    </section>
                                </CardContent>
                            </ScrollArea>
                        </Card>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
