import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Heart, Users } from 'lucide-react';
const values = [{
  icon: Target,
  title: 'Excellence',
  description: 'We pursue the highest standards in education and character development.'
}, {
  icon: Heart,
  title: 'Integrity',
  description: 'We uphold honesty, transparency, and ethical conduct in all we do.'
}, {
  icon: Users,
  title: 'Community',
  description: 'We foster a supportive environment where every student belongs.'
}, {
  icon: Eye,
  title: 'Innovation',
  description: 'We embrace modern teaching methods while honoring traditional values.'
}];
export default function About() {
  return <PublicLayout>
      {/* Hero */}
      <section className="gradient-primary py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              About ALHIDAYA CENTRE
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              A legacy of educational excellence spanning over two decades
            </p>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-bold text-foreground text-center">
              Our History
            </h2>
            <div className="mt-4 h-1 w-24 mx-auto gradient-gold rounded-full" />
            <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Founded in 1993, ALHIDAYA CENTRE began as a small educational institution with a vision to provide quality education that combines academic excellence with strong moral values. What started with just 50 students has grown into a thriving center of learning.
              </p>
              <p>
                Over the years, we have expanded our facilities, enhanced our curriculum, and 
                welcomed dedicated educators who share our commitment to nurturing young minds. 
                Our graduates have gone on to achieve remarkable success in various fields, 
                from medicine and engineering to business and public service.
              </p>
              <p>
                Today, ALHIDAYA CENTRE stands as a nationally recognized institution, known for 
                its rigorous academic programs, innovative teaching methods, and the verified 
                authenticity of its certifications. We continue to evolve while staying true to 
                our founding principles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  To be a leading educational institution that produces graduates of exceptional 
                  character, equipped with knowledge and skills to lead positive change in their 
                  communities and beyond.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 mb-4">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  To provide comprehensive education that develops intellectual curiosity, 
                  critical thinking, and ethical values. We strive to create a nurturing 
                  environment where every student can discover and develop their full potential.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">Our Core Values</h2>
            <div className="mt-4 h-1 w-24 mx-auto gradient-gold rounded-full" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(value => <Card key={value.title} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">Our Leadership</h2>
            <div className="mt-4 h-1 w-24 mx-auto gradient-gold rounded-full" />
            <p className="mt-8 text-muted-foreground leading-relaxed">
              ALHIDAYA CENTRE is guided by a dedicated team of experienced educators and 
              administrators who bring decades of combined experience in education. Our 
              leadership team is committed to maintaining the highest standards of academic 
              excellence while fostering an inclusive and supportive learning environment.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Under their guidance, the institution has achieved numerous accolades and 
              continues to innovate in curriculum development, teaching methodologies, and 
              student support services.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>;
}