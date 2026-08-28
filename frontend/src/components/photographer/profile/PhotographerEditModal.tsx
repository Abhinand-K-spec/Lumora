import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { DISTRICTS, SERVICES } from "../../../constants/profileOptions";

interface PhotographerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    name: string;
    bio: string;
    specialities: string[];
    location: string;
    languages: string[];
    equipment: string[];
    serviceRegions?: string[];
  };
  onSave: (updatedData: {
    name: string;
    bio: string;
    specialities: string[];
    location: string;
    languages: string[];
    equipment: string[];
    serviceRegions?: string[];
  }) => void;
}

const PhotographerEditModal = ({
  isOpen,
  onClose,
  profileData,
  onSave,
}: PhotographerEditModalProps) => {
  const [name, setName] = useState(profileData.name);
  const [bio, setBio] = useState(profileData.bio);
  const [location, setLocation] = useState(profileData.location);
  const [specialities, setSpecialities] = useState<string[]>([...profileData.specialities]);
  const [languages, setLanguages] = useState<string[]>([...profileData.languages]);
  const [equipment, setEquipment] = useState<string[]>([...profileData.equipment]);
  const [serviceRegions, setServiceRegions] = useState<string[]>([...(profileData.serviceRegions || [])]);

  const [newSpeciality, setNewSpeciality] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newGear, setNewGear] = useState("");
  const [newRegion, setNewRegion] = useState("");

  // Keep state in sync when profileData changes
  useEffect(() => {
    setName(profileData.name);
    setBio(profileData.bio);
    setLocation(profileData.location);
    setSpecialities([...profileData.specialities]);
    setLanguages([...profileData.languages]);
    setEquipment([...profileData.equipment]);
    setServiceRegions([...(profileData.serviceRegions || [])]);
  }, [profileData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      bio,
      location,
      specialities,
      languages,
      equipment,
      serviceRegions,
    });
    onClose();
  };

  const addRegion = () => {
    if (newRegion.trim() && !serviceRegions.includes(newRegion.trim())) {
      setServiceRegions([...serviceRegions, newRegion.trim()]);
      setNewRegion("");
    }
  };

  const removeRegion = (item: string) => {
    setServiceRegions(serviceRegions.filter((r) => r !== item));
  };

  const addSpeciality = () => {
    if (newSpeciality.trim() && !specialities.includes(newSpeciality.trim())) {
      setSpecialities([...specialities, newSpeciality.trim()]);
      setNewSpeciality("");
    }
  };

  const removeSpeciality = (item: string) => {
    setSpecialities(specialities.filter((s) => s !== item));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (item: string) => {
    setLanguages(languages.filter((l) => l !== item));
  };

  const addGear = () => {
    if (newGear.trim() && !equipment.includes(newGear.trim())) {
      setEquipment([...equipment, newGear.trim()]);
      setNewGear("");
    }
  };

  const removeGear = (item: string) => {
    setEquipment(equipment.filter((g) => g !== item));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0f1012] border border-border/30 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-neutral-950 border-b border-border/10 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-text tracking-wide">Edit Profile Narrative</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-neutral-900 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* Display Name */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Based In (Location)</label>
            <select
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition cursor-pointer"
            >
              <option value="" disabled>Select Location</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Service Areas */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Service Areas / Regions</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {serviceRegions.map((region) => (
                <span key={region} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text border border-border/20 px-2 py-0.5 rounded">
                  {region}
                  <button
                    type="button"
                    onClick={() => removeRegion(region)}
                    className="text-text-secondary hover:text-red-400 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <select
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none cursor-pointer focus:border-primary/50 transition"
              >
                <option value="">Select Service Area...</option>
                {DISTRICTS.filter(d => !serviceRegions.includes(d)).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addRegion}
                disabled={!newRegion}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Narrative statement */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Narrative Vision</label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-2.5 text-xs text-text outline-none focus:border-primary/50 transition resize-none leading-relaxed"
            />
          </div>

          {/* Specialities tags input */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Core Specialities</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {specialities.map((spec) => (
                <span key={spec} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-primary border border-primary/20 px-2 py-0.5 rounded">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpeciality(spec)}
                    className="text-text-secondary hover:text-red-400 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <select
                value={newSpeciality}
                onChange={(e) => setNewSpeciality(e.target.value)}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none cursor-pointer focus:border-primary/50 transition"
              >
                <option value="">Select Speciality...</option>
                {SERVICES.filter(s => !specialities.includes(s)).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSpeciality}
                disabled={!newSpeciality}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Languages tags */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Languages Spoken</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {languages.map((lang) => (
                <span key={lang} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text-secondary border border-border/20 px-2 py-0.5 rounded">
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="text-text-secondary hover:text-red-400 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add language (e.g. Spanish)"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none"
              />
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 text-text font-bold text-xs rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Equipment Inventory */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Equipment List</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {equipment.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text-secondary border border-border/20 px-2.5 py-0.5 rounded">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeGear(item)}
                    className="text-text-secondary hover:text-red-400 font-bold ml-1 cursor-pointer"
                  >
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add equipment gear"
                value={newGear}
                onChange={(e) => setNewGear(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGear())}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none"
              />
              <button
                type="button"
                onClick={addGear}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 text-text font-bold text-xs rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-border/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-secondary transition cursor-pointer"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default PhotographerEditModal;
