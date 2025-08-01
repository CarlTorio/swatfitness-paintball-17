import React from 'react';
import { Star, Users, MapPin, Headphones, Shield, Trophy } from 'lucide-react';
const equipmentImage = 'https://i.imgur.com/PVQtQL2.jpeg';
const WhyChooseUs = () => {
  const features = [{
    icon: Star,
    title: "Professional Experience",
    description: "Years of expertise in tactical training and team building activities"
  }, {
    icon: Headphones,
    title: "7 Days Support",
    description: "Available via phone, email, and Facebook Monday through Sunday"
  }, {
    icon: Shield,
    title: "Safety First Approach",
    description: "Professional marshals, comprehensive safety briefings, and top-grade equipment"
  }, {
    icon: Users,
    title: "PH's Most Trusted",
    description: "Consistently rated as the PH's premier paintball experience by our customers"
  }];
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
              WHY CHOOSE <span className="text-accent">SWAT FITNESS PAINTBALL</span>?
            </h2>
            
            <p className="font-military text-xl text-muted-foreground mb-8 leading-relaxed">SWAT fitness paintball for professional tactical training that combines intense fitness conditioning with effective team-building in a controlled environment.</p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return <div key={index} className="flex items-start space-x-4 group">
                    <div className="bg-gradient-tactical rounded-lg p-3 shadow-tactical group-hover:shadow-elevated transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="font-military text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>;
            })}
            </div>

            {/* Trust Indicators */}
            
          </div>

          {/* Image Side */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-elevated">
              <img src={equipmentImage} alt="Professional paintball equipment" className="w-full h-auto lg:aspect-square object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/80 via-transparent to-transparent"></div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-display font-bold text-xl mb-2">Professional Equipment</h3>
                <p className="font-military text-white/90">Latest paintball markers, safety gear, and tactical equipment</p>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-lg p-4 shadow-action">
              <div className="text-center">
                <div className="font-display font-bold text-2xl">PH's #1</div>
                <div className="font-military text-sm">Paintball Field</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default WhyChooseUs;