import type { User as UserType } from "../../../types/user";

interface UserStatsProps {
  users: UserType[];
}

const UserStats = ({ users }: UserStatsProps) => {
  const total = users.length;
  const active = users.filter((u) => u.accountStatus === "ACTIVE").length;
  const suspended = users.filter((u) => u.accountStatus === "SUSPENDED").length;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Total Users */}
      <div className="border border-border/40 bg-[#121214]/40 backdrop-blur-sm rounded-lg p-6 shadow-md">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Total Users
        </p>
        <h3 className="text-5xl font-heading text-primary font-medium mt-3">
          {formatNumber(total)}
        </h3>
      </div>

      {/* Active Users */}
      <div className="border border-border/40 bg-[#121214]/40 backdrop-blur-sm rounded-lg p-6 shadow-md">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Active Users
        </p>
        <h3 className="text-5xl font-heading text-primary font-medium mt-3">
          {formatNumber(active)}
        </h3>
      </div>

      {/* Suspended Users */}
      <div className="border border-border/40 bg-[#121214]/40 backdrop-blur-sm rounded-lg p-6 shadow-md">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Suspended Users
        </p>
        <h3 className="text-5xl font-heading text-primary font-medium mt-3">
          {formatNumber(suspended)}
        </h3>
      </div>
    </div>
  );
};

export default UserStats;
