
'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, BrainCircuit, ListChecks, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="text-center p-6 bg-card rounded-lg shadow-lg transition-transform transform hover:-translate-y-2">
    <div className="inline-block p-4 bg-primary/10 text-primary rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const PricingTier = ({ title, price, description, features, isFeatured = false }: { title: string, price: string, description: string, features: string[], isFeatured?: boolean }) => (
  <Card className={cn("flex flex-col", isFeatured ? "border-primary ring-2 ring-primary shadow-2xl" : "")}>
    <CardHeader className="text-center">
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <p className="text-5xl font-extrabold my-4">{price}</p>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col">
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button asChild size="lg" className={cn("w-full", !isFeatured && "bg-accent text-accent-foreground hover:bg-accent/90")}>
        <Link href="/planner">{isFeatured ? "Inizia Ora" : "Parti Gratis"}</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 bg-card/50 overflow-hidden">
           <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom mask-image-hero"></div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4 animate-fade-in-up">
              Il Tuo Compagno di Viaggio Intelligente
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up animation-delay-300">
              Crea itinerari di viaggio personalizzati e liste valigia in pochi secondi. Lascia che l'AI si occupi della pianificazione, tu goditi l'avventura.
            </p>
            <Button asChild size="lg" className="animate-fade-in-up animation-delay-600">
              <Link href="/planner">Pianifica il Tuo Viaggio Ora</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Perché Waylo AI?</h2>
              <p className="text-lg text-muted-foreground mt-4">
                Semplifichiamo la pianificazione del viaggio con strumenti intelligenti progettati per te.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BrainCircuit className="h-8 w-8" />}
                title="Itinerari AI-Powered"
                description="Ottieni piani di viaggio dettagliati e ottimizzati, generati istantaneamente in base ai tuoi interessi e al tuo budget."
              />
              <FeatureCard 
                icon={<ListChecks className="h-8 w-8" />}
                title="Checklist Valigia Intelligente"
                description="Non dimenticare più nulla. Genera una checklist completa basata sulla destinazione, il meteo e le attività previste."
              />
              <FeatureCard 
                icon={<Star className="h-8 w-8" />}
                title="Salva e Modifica i Viaggi"
                description="Gli utenti Premium possono salvare, rivedere e modificare i loro itinerari in qualsiasi momento, anche con l'aiuto dell'AI."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28 bg-card/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Come Funziona</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-4 max-w-xs">
                <div className="text-5xl font-extrabold text-primary/30">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-left">Descrivi il Viaggio</h3>
                  <p className="text-muted-foreground text-left">Inserisci destinazione, date, budget e interessi.</p>
                </div>
              </div>
               <div className="flex items-center gap-4 max-w-xs">
                <div className="text-5xl font-extrabold text-primary/50">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-left">Genera il Piano</h3>
                  <p className="text-muted-foreground text-left">La nostra AI crea un itinerario dettagliato e una lista valigia.</p>
                </div>
              </div>
               <div className="flex items-center gap-4 max-w-xs">
                <div className="text-5xl font-extrabold text-primary">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-left">Parti e Goditi</h3>
                  <p className="text-muted-foreground text-left">Viaggia senza stress con un piano perfetto in tasca.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Scegli il Piano Giusto per Te</h2>
              <p className="text-lg text-muted-foreground mt-4">
                Inizia gratis e passa a premium quando vuoi per sbloccare tutte le funzionalità.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PricingTier 
                title="Base"
                price="Gratis"
                description="Perfetto per provare le funzionalità base."
                features={[
                  "3 generazioni di itinerari al mese",
                  "Accesso parziale all'itinerario (primi giorni)",
                  "Accesso parziale alla lista valigia",
                  "Nessun salvataggio dei viaggi",
                ]}
              />
               <PricingTier 
                title="Premium"
                price="9,99€"
                description="L'esperienza completa per viaggiatori seri."
                features={[
                  "Generazioni illimitate",
                  "Accesso completo a itinerario e lista valigia",
                  "Salvataggio e storico dei viaggi",
                  "Modifica itinerari con l'AI",
                  "Supporto prioritario",
                ]}
                isFeatured
              />
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
