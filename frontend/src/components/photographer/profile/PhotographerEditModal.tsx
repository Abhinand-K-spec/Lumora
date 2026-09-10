import { useState, useEffect } from "react";
import { X, Trash2, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { InstagramIcon } from "../../common/InstagramIcon";
import { DISTRICTS, SERVICES } from "../../../constants/profileOptions";
import { photographerEditSchema } from "../../../schemas/photographerEditSchema";

interface PhotographerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    name: string;
    phone?: string;
    bio: string;
    specialities: string[];
    location: string;
    languages: string[];
    equipment: string[];
    serviceRegions?: string[];
    instagramUrl?: string;
  };
  onSave: (updatedData: {
    name: string;
    phone?: string;
    bio: string;
    specialities: string[];
    location: string;
    languages: string[];
    equipment: string[];
    serviceRegions?: string[];
    instagramUrl?: string;
  }) => void;
}

const PhotographerEditModal = ({
  isOpen,
  onClose,
  profileData,
  onSave,
}: PhotographerEditModalProps) => {
  const [name, setName] = useState(profileData.name);
  const [phone, setPhone] = useState(profileData.phone || "");
  const [bio, setBio] = useState(profileData.bio);
  const [location, setLocation] = useState(profileData.location);
  const [instagramUrl, setInstagramUrl] = useState(
    profileData.instagramUrl || "",
  );
  const [specialities, setSpecialities] = useState<string[]>([
    ...profileData.specialities,
  ]);
  const [languages, setLanguages] = useState<string[]>([
    ...profileData.languages,
  ]);
  const [equipment, setEquipment] = useState<string[]>([
    ...profileData.equipment,
  ]);
  const [serviceRegions, setServiceRegions] = useState<string[]>([
    ...(profileData.serviceRegions || []),
  ]);

  const [newSpeciality, setNewSpeciality] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newGear, setNewGear] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagErrors, setTagErrors] = useState<Record<string, string>>({});

  // Keep state in sync when profileData changes
  useEffect(() => {
    setName(profileData.name);
    setPhone(profileData.phone || "");
    setBio(profileData.bio);
    setLocation(profileData.location);
    setInstagramUrl(profileData.instagramUrl || "");
    setSpecialities([...profileData.specialities]);
    setLanguages([...profileData.languages]);
    setEquipment([...profileData.equipment]);
    setServiceRegions([...(profileData.serviceRegions || [])]);
    setErrors({});
    setTagErrors({});
  }, [profileData, isOpen]);

  if (!isOpen) return null;

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      location: location.trim(),
      instagramUrl: instagramUrl.trim() || undefined,
      specialities,
      languages,
      equipment,
      serviceRegions,
    };

    const validationResult = photographerEditSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const path = issue.path[0];
        if (path && typeof path === "string" && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Please correct the errors in the profile form.");
      return;
    }

    setErrors({});
    onSave({
      name: formData.name,
      phone: formData.phone,
      bio: formData.bio || "",
      location: formData.location,
      instagramUrl: formData.instagramUrl,
      specialities,
      languages,
      equipment,
      serviceRegions,
    });
    onClose();
  };

  const addRegion = () => {
    setTagErrors((prev) => ({ ...prev, region: "" }));
    const trimmed = newRegion.trim();
    if (!trimmed) return;

    if (serviceRegions.includes(trimmed)) {
      setTagErrors((prev) => ({
        ...prev,
        region: "Service area is already added",
      }));
      return;
    }
    if (serviceRegions.length >= 20) {
      setTagErrors((prev) => ({
        ...prev,
        region: "Maximum 20 service areas allowed",
      }));
      return;
    }

    setServiceRegions([...serviceRegions, trimmed]);
    setNewRegion("");
  };

  const removeRegion = (item: string) => {
    setServiceRegions(serviceRegions.filter((r) => r !== item));
  };

  const addSpeciality = () => {
    setTagErrors((prev) => ({ ...prev, speciality: "" }));
    const trimmed = newSpeciality.trim();
    if (!trimmed) return;

    if (specialities.includes(trimmed)) {
      setTagErrors((prev) => ({
        ...prev,
        speciality: "Speciality is already added",
      }));
      return;
    }
    if (specialities.length >= 10) {
      setTagErrors((prev) => ({
        ...prev,
        speciality: "Maximum 10 specialities allowed",
      }));
      return;
    }

    setSpecialities([...specialities, trimmed]);
    setNewSpeciality("");
  };

  const removeSpeciality = (item: string) => {
    setSpecialities(specialities.filter((s) => s !== item));
  };

  const addLanguage = () => {
    setTagErrors((prev) => ({ ...prev, language: "" }));
    const trimmed = newLanguage.trim();
    if (!trimmed) return;

    if (trimmed.length < 2) {
      setTagErrors((prev) => ({
        ...prev,
        language: "Language must be at least 2 characters",
      }));
      return;
    }
    if (trimmed.length > 30) {
      setTagErrors((prev) => ({
        ...prev,
        language: "Language cannot exceed 30 characters",
      }));
      return;
    }
    if (languages.map((l) => l.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTagErrors((prev) => ({
        ...prev,
        language: "Language is already added",
      }));
      return;
    }
    if (languages.length >= 10) {
      setTagErrors((prev) => ({
        ...prev,
        language: "Maximum 10 languages allowed",
      }));
      return;
    }

    setLanguages([...languages, trimmed]);
    setNewLanguage("");
  };

  const removeLanguage = (item: string) => {
    setLanguages(languages.filter((l) => l !== item));
  };

  const addGear = () => {
    setTagErrors((prev) => ({ ...prev, gear: "" }));
    const trimmed = newGear.trim();
    if (!trimmed) return;

    if (trimmed.length < 2) {
      setTagErrors((prev) => ({
        ...prev,
        gear: "Gear name must be at least 2 characters",
      }));
      return;
    }
    if (trimmed.length > 60) {
      setTagErrors((prev) => ({
        ...prev,
        gear: "Gear name cannot exceed 60 characters",
      }));
      return;
    }
    if (equipment.map((g) => g.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTagErrors((prev) => ({ ...prev, gear: "Gear item is already added" }));
      return;
    }
    if (equipment.length >= 20) {
      setTagErrors((prev) => ({
        ...prev,
        gear: "Maximum 20 gear items allowed",
      }));
      return;
    }

    setEquipment([...equipment, trimmed]);
    setNewGear("");
  };

  const removeGear = (item: string) => {
    setEquipment(equipment.filter((g) => g !== item));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0f1012] border border-border/30 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-neutral-950 border-b border-border/10 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-text tracking-wide">
              Edit Profile Narrative
            </h3>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Manage your credentials, contact, and public portfolio links.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-neutral-900 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin"
        >
          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                Display Name <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-text-secondary/50">
                {name.length}/50
              </span>
            </div>
            <input
              type="text"
              value={name}
              maxLength={50}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
              placeholder="e.g. Arjun Nair"
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-xs text-text outline-none transition ${
                errors.name
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-border/20 focus:border-primary/50"
              }`}
            />
            {errors.name && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={12} className="flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary pointer-events-none">
                <Phone size={14} />
              </span>
              <input
                type="tel"
                placeholder="9876543210 or +91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError("phone");
                }}
                className={`w-full bg-neutral-950 border rounded-lg pl-9 pr-4 py-2.5 text-xs text-text outline-none transition placeholder:text-text-secondary/40 ${
                  errors.phone
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-border/20 focus:border-primary/50"
                }`}
              />
            </div>
            {errors.phone ? (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={12} className="flex-shrink-0" />
                {errors.phone}
              </p>
            ) : (
              <p className="text-[10px] text-text-secondary/50 mt-1.5">
                Direct 10-digit mobile number for client bookings and
                verification.
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Based In (Location) <span className="text-red-400">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                clearFieldError("location");
              }}
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-xs text-text outline-none transition cursor-pointer ${
                errors.location
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-border/20 focus:border-primary/50"
              }`}
            >
              <option value="">Select Location</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={12} className="flex-shrink-0" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Instagram Profile URL */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Instagram Profile URL
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#E1306C] pointer-events-none">
                <InstagramIcon size={14} />
              </span>
              <input
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={instagramUrl}
                onChange={(e) => {
                  setInstagramUrl(e.target.value);
                  clearFieldError("instagramUrl");
                }}
                className={`w-full bg-neutral-950 border rounded-lg pl-9 pr-4 py-2.5 text-xs text-text outline-none transition placeholder:text-text-secondary/40 ${
                  errors.instagramUrl
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-border/20 focus:border-primary/50"
                }`}
              />
            </div>
            {errors.instagramUrl ? (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={12} className="flex-shrink-0" />
                {errors.instagramUrl}
              </p>
            ) : (
              <p className="text-[10px] text-text-secondary/50 mt-1.5">
                Required for marketplace verification — your public Instagram
                portfolio.
              </p>
            )}
          </div>

          {/* Service Areas */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Service Areas / Regions ({serviceRegions.length}/20)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {serviceRegions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text border border-border/20 px-2 py-0.5 rounded"
                >
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
                onChange={(e) => {
                  setNewRegion(e.target.value);
                  setTagErrors((prev) => ({ ...prev, region: "" }));
                }}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none cursor-pointer focus:border-primary/50 transition"
              >
                <option value="">Select Service Area...</option>
                {DISTRICTS.filter((d) => !serviceRegions.includes(d)).map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
              <button
                type="button"
                onClick={addRegion}
                disabled={!newRegion}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tagErrors.region && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {tagErrors.region}
              </p>
            )}
          </div>

          {/* Narrative statement (Bio) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                Narrative Vision (Bio)
              </label>
              <span
                className={`text-[10px] ${bio.length > 950 ? "text-amber-400" : "text-text-secondary/50"}`}
              >
                {bio.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                clearFieldError("bio");
              }}
              placeholder="Tell clients about your creative philosophy, experience, and the stories behind your lens..."
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-xs text-text outline-none transition resize-none leading-relaxed placeholder:text-text-secondary/40 ${
                errors.bio
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-border/20 focus:border-primary/50"
              }`}
            />
            {errors.bio && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={12} className="flex-shrink-0" />
                {errors.bio}
              </p>
            )}
          </div>

          {/* Specialities tags input */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Core Specialities ({specialities.length}/10)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {specialities.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-primary border border-primary/20 px-2 py-0.5 rounded"
                >
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
                onChange={(e) => {
                  setNewSpeciality(e.target.value);
                  setTagErrors((prev) => ({ ...prev, speciality: "" }));
                }}
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none cursor-pointer focus:border-primary/50 transition"
              >
                <option value="">Select Speciality...</option>
                {SERVICES.filter((s) => !specialities.includes(s)).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSpeciality}
                disabled={!newSpeciality}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tagErrors.speciality && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {tagErrors.speciality}
              </p>
            )}
          </div>

          {/* Languages tags */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Languages Spoken ({languages.length}/10)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text-secondary border border-border/20 px-2 py-0.5 rounded"
                >
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
                maxLength={30}
                placeholder="Add language (e.g. English, Malayalam)"
                value={newLanguage}
                onChange={(e) => {
                  setNewLanguage(e.target.value);
                  setTagErrors((prev) => ({ ...prev, language: "" }));
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addLanguage())
                }
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-primary/50 transition placeholder:text-text-secondary/40"
              />
              <button
                type="button"
                onClick={addLanguage}
                disabled={!newLanguage.trim()}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tagErrors.language && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {tagErrors.language}
              </p>
            )}
          </div>

          {/* Equipment Inventory */}
          <div>
            <label className="block text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">
              Equipment List ({equipment.length}/20)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {equipment.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-950 text-text-secondary border border-border/20 px-2.5 py-0.5 rounded"
                >
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
                maxLength={60}
                placeholder="Add gear (e.g. Sony A7 IV, 24-70mm GM II, DJI Mini 4 Pro)"
                value={newGear}
                onChange={(e) => {
                  setNewGear(e.target.value);
                  setTagErrors((prev) => ({ ...prev, gear: "" }));
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addGear())
                }
                className="flex-1 bg-neutral-950 border border-border/20 rounded-lg px-3 py-2 text-xs text-text outline-none focus:border-primary/50 transition placeholder:text-text-secondary/40"
              />
              <button
                type="button"
                onClick={addGear}
                disabled={!newGear.trim()}
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-border/20 disabled:opacity-50 disabled:hover:bg-neutral-950 text-text font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
            {tagErrors.gear && (
              <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {tagErrors.gear}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-border/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-secondary transition cursor-pointer shadow-lg shadow-primary/10 active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerEditModal;
