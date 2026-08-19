import { UserCheck, UserX, Trash2 } from "lucide-react";
import type { accountStatus } from "../../../types/user";

interface UserActionsProps {
  status: accountStatus;
  onChangeStatus: (newStatus: accountStatus) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const UserActions = ({
  status,
  onChangeStatus,
  onDelete,
  disabled = false,
}: UserActionsProps) => {
  const isSuspended = status === "SUSPENDED";

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Status Action */}
      <button
        onClick={() =>
          onChangeStatus(
            isSuspended
              ? ("ACTIVE" as accountStatus)
              : ("SUSPENDED" as accountStatus),
          )
        }
        disabled={disabled}
        title={isSuspended ? "Activate User" : "Suspend User"}
        className={`p-2 rounded-lg border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isSuspended
            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
            : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
        }`}
      >
        {isSuspended ? <UserCheck size={16} /> : <UserX size={16} />}
      </button>

      {/* Delete Action */}
      <button
        onClick={onDelete}
        disabled={disabled}
        title="Delete User"
        className="p-2 rounded-lg border bg-error/10 text-error border-error/20 hover:bg-error/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default UserActions;
