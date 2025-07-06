
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="bg-muted/40">
      <div className="container text-center py-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
          <Link href="/contact" className="ml-4 text-primary hover:underline font-medium">Contact Us</Link>
          <Link href="/subscriptions" className="ml-4 text-primary hover:underline font-medium">Pricing</Link>
        </p>
      </div>
    </footer>
  );
}
