import { Plane } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Waylo AI
          </h1>
        </div>
      </div>
    </header>
  );
}
