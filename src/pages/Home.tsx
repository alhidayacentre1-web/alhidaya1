import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
const highlights = [{
  icon: Calendar,
  title: '33+ Years',
  description: 'Of educational excellence'
}, {
  icon: Users,
  title: '5,000+',
  description: 'Successful graduates'
}, {
  icon: Award,
  title: 'Accredited',
  description: 'Nationally recognized'
}, {
  icon: CheckCircle,
  title: 'Verified',
  description: 'Secure certificate system'
}];
export default function Home() {
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-secondary/20 px-4 py-2">
              <Shield className="mr-2 h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">Trusted Educational Institution</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              ALHIDAYA CENTRE
            </h1>
            <p className="mt-2 font-serif text-xl text-secondary md:text-2xl">
              Excellence in Education
            </p>
            <p className="mt-6 text-lg text-primary-foreground/80 md:text-xl">
              Nurturing minds, building character, and shaping futures through quality education 
              and verified academic excellence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/verify">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify Certificate
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(item => <Card key={item.title} className="border-0 shadow-lg animate-fade-in">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Welcome to ALHIDAYA CENTRE
            </h2>
            <div className="mt-4 h-1 w-24 mx-auto gradient-gold rounded-full" />
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">For over three decades, ALHIDAYA CENTRE has been a beacon of educational excellence. Our commitment to academic rigor, character development, and holistic growth has produced thousands of successful graduates who are making meaningful contributions to society.</p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              We take pride in our transparent verification system that ensures the authenticity 
              of every certificate we issue. Employers and institutions can easily verify our 
              graduates' credentials through our secure online platform.
            </p>
            <Link to="/about" className="inline-block mt-8">
              <Button variant="outline" className="font-medium">
                Discover Our Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="gradient-primary p-8 md:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-serif text-2xl font-bold text-primary-foreground md:text-3xl">
                  Need to Verify a Certificate?
                </h2>
                <p className="mt-4 text-primary-foreground/80">
                  Use our secure verification system to confirm the authenticity of any 
                  certificate issued by ALHIDAYA CENTRE.
                </p>
                <Link to="/verify" className="inline-block mt-6">
                  <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verify Now
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>;
}