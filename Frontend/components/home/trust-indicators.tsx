import { Truck, RotateCcw, Headphones, Shield } from "lucide-react";

const indicators = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "No questions asked",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here for you",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% protected",
  },
];

export function TrustIndicators() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {indicators.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <item.icon className="w-6 h-6 text-foreground flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <h4 className="font-display font-bold text-sm">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
