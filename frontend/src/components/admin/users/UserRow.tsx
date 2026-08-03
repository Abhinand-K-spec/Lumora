import type { User as UserType } from "../../../types/user";
import type { accountStatus } from "../../../../../backend/src/shared/enums/accountStatus";
import UserActions from "./UserActions";

interface UserRowProps {
  user: UserType;
  onChangeStatus: (id: string, status: accountStatus) => void;
  onDelete: (user: UserType) => void;
  disabled?: boolean;
}

const UserRow = ({
  user,
  onChangeStatus,
  onDelete,
  disabled = false,
}: UserRowProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const userShortId = `#LM-${user._id.slice(-5).toUpperCase()}`;

  return (
    <tr className="border-b border-border/30 hover:bg-white/[0.01] transition-colors group">
      {/* USER ID */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-secondary/70 group-hover:text-text-secondary transition-colors">
        {userShortId}
      </td>

      {/* NAME */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {/* Avatar / Initials */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-neutral-900/60 font-bold text-xs text-primary shadow-sm">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
              {user.name}
            </div>
            <div className="text-[10px] text-text-secondary/80">Client</div>
          </div>
        </div>
      </td>

      {/* EMAIL */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary/85">
        {user.email}
      </td>

      {/* STATUS */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${user.accountStatus === "ACTIVE" ? "bg-success" : "bg-error"}`} />
          <span className="text-[13px] font-medium text-text">
            {user.accountStatus === "ACTIVE" ? "Active" : "Suspended"}
          </span>
        </div>
      </td>

      {/* JOIN DATE */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary/85">
        {formatDate(user.createdAt)}
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <UserActions
          status={user.accountStatus}
          onChangeStatus={(newStatus) => onChangeStatus(user._id, newStatus)}
          onDelete={() => onDelete(user)}
          disabled={disabled}
        />
      </td>
    </tr>
  );
};

export default UserRow;
