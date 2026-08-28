interface MetricCardProps {
  label: string;
  value: string;
  subValue: string;
  highlightText?: string;
}

const MetricCard = ({ label, value, subValue, highlightText }: MetricCardProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 px-6 py-5 rounded-xl shadow-sm flex flex-col justify-center">
      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h4 className="text-3xl font-bold font-heading text-text tracking-wide">{value}</h4>
        {highlightText && (
          <span className="text-[10px] font-bold text-primary">{highlightText}</span>
        )}
      </div>
      <p className="text-[11px] text-text-secondary mt-1">{subValue}</p>
    </div>
  );
};

interface PhotographerMetricsProps {
  totalBookings: number;
  bookingsThisMonth: number;
  experienceYears: number;
  completionRate: number;
  serviceRegions: string[];
}

const PhotographerMetrics = ({
  totalBookings = 342,
  bookingsThisMonth = 12,
  experienceYears = 8,
  completionRate = 98,
  serviceRegions = ["Kerala", "UAE"],
}: PhotographerMetricsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-8 mt-4 select-none">
      
      <MetricCard
        label="Total Bookings"
        value={String(totalBookings)}
        subValue="completed total"
        highlightText={`+${bookingsThisMonth} this month`}
      />

      <MetricCard
        label="Experience"
        value={`${experienceYears}+`}
        subValue="active projects"
        highlightText="Years Pro"
      />

      <MetricCard
        label="Completion Rate"
        value={`${completionRate}%`}
        subValue="On-time delivery"
      />

      <MetricCard
        label="Service Region"
        value={serviceRegions[0]}
        subValue={`& ${serviceRegions.slice(1).join(", ")}`}
      />

    </div>
  );
};

export default PhotographerMetrics;
