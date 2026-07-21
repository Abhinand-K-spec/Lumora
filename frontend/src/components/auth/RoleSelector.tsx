import {User, Camera} from 'lucide-react';


const RoleSelector = () => {
    return (
  
        <div className="mt-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Select Role
        </label>
      
        <div className="flex rounded-xl border border-border bg-card p-1">
        <button className="text-text-secondary flex flex-1 items-center justify-center gap-2 rounded-lg py-3">
            <User size={18} />
            <span>Client</span>
        </button>

        <button className="text-text-secondary flex flex-1 items-center justify-center gap-2 rounded-lg py-3">
            <Camera size={18} />
            <span>Photographer</span>
        </button>
        </div>
      </div>
  
    );
  };
  
  export default RoleSelector;