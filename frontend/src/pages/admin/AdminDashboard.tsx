import useAdminAuth from "../../hooks/useAdminAuth";
import { toast } from "sonner";
import { LogOut, Shield } from "lucide-react";

const AdminDashboard = () => {
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Admin logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-[#2B2B2B] bg-[#171717] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-[#2B2B2B] pb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">
              Admin Control Center
            </h1>
            <p className="text-text-secondary text-sm">
              Overview of system settings and administrative actions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-900 rounded-xl border border-[#222]">
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                Logged In As
              </span>
              <p className="font-semibold text-lg mt-1">
                {admin?.name || "Admin"}
              </p>
            </div>
            <div className="p-4 bg-neutral-900 rounded-xl border border-[#222]">
              <span className="text-xs text-text-secondary uppercase tracking-wider">
                System Role
              </span>
              <p className="font-semibold text-lg mt-1 text-primary">
                {admin?.role || "ADMIN"}
              </p>
            </div>
          </div>
          <div className="p-4 bg-neutral-900 rounded-xl border border-[#222]">
            <span className="text-xs text-text-secondary uppercase tracking-wider">
              Email Address
            </span>
            <p className="font-semibold text-lg mt-1">
              {admin?.email || "admin@lumora.com"}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-medium transition cursor-pointer border border-red-500/20"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
