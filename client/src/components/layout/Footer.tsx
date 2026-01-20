import { Link } from 'wouter';

export function Footer() {
    return (
        <footer className="py-8 border-t border-border/50 bg-background/50 backdrop-blur-sm z-40 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <img src="/seu.png" alt="SEU Logo" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-display font-bold text-lg gradient-text">SEU CampusHub</span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                        <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
                    </nav>
                </div>

                <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} SEU CampusHub. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
