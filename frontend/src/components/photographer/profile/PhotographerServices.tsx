interface PackageItem {
  id: string;
  title: string;
  price: string; // e.g. "₹1.8L+"
  description: string;
}

interface PhotographerServicesProps {
  packages?: PackageItem[];
}

const PhotographerServices = ({
  packages = [
    {
      id: "pkg1",
      title: "Elite Wedding Story",
      price: "₹1.8L+",
      description: "Full coverage, cinematic film, and premium physical album.",
    },
    {
      id: "pkg2",
      title: "Commercial Fashion",
      price: "₹75K+",
      description: "Half-day shoot, 15 retouched edits, and studio rental included.",
    },
    {
      id: "pkg3",
      title: "Luxury Portraits",
      price: "₹35K+",
      description: "2-hour session, digital gallery, and mobile-ready assets.",
    },
  ],
}: PhotographerServicesProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6 select-none">
      
      {/* Title */}
      <h3 className="font-heading text-lg font-semibold text-text tracking-wide mb-4.5">
        Service Packages
      </h3>

      {/* Package Rows */}
      <div className="space-y-3">
        {packages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className="bg-neutral-900/40 border border-border/10 px-5 py-4 rounded-xl flex flex-col justify-between hover:border-border/30 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-heading text-sm font-semibold text-text group-hover:text-primary transition-colors">
                  {pkg.title}
                </h4>
                <span className="text-xs font-bold text-primary tracking-wide">
                  {pkg.price}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                {pkg.description}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default PhotographerServices;
