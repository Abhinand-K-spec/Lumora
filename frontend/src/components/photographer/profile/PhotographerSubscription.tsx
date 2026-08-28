interface PhotographerSubscriptionProps {
  currentPlan?: string;
  billingCycle?: string;
  nextRenewal?: string;
}

const PhotographerSubscription = ({
  currentPlan = "Lumora Elite",
  billingCycle = "Annual",
  nextRenewal = "Oct 12, 2026",
}: PhotographerSubscriptionProps) => {
  return (
    <div className="bg-[#0f1012] border border-border/20 rounded-xl p-6.5 select-none">
      
      {/* Title */}
      <h3 className="font-heading text-lg font-semibold text-text tracking-wide mb-4">
        Subscription Plan
      </h3>

      {/* Subscription details */}
      <div className="space-y-3.5">
        
        {/* Row 1 */}
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/10">
          <span className="text-text-secondary">Current Plan</span>
          <span className="font-semibold text-primary">{currentPlan}</span>
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/10">
          <span className="text-text-secondary">Billing Cycle</span>
          <span className="font-semibold text-text">{billingCycle}</span>
        </div>

        {/* Row 3 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Next Renewal</span>
          <span className="font-semibold text-text">{nextRenewal}</span>
        </div>

      </div>

      {/* Manage Plan Button */}
      <button className="w-full mt-6 py-2.5 bg-transparent border border-primary text-primary hover:bg-primary/5 active:scale-[0.99] transition font-bold text-xs rounded-lg cursor-pointer">
        MANAGE PLAN
      </button>

    </div>
  );
};

export default PhotographerSubscription;
