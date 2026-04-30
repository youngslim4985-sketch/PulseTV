/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Plus, User } from "lucide-react";
import { Profile } from "../types";

interface ProfilePickerProps {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
  onAdd: () => void;
}

export default function ProfilePicker({ profiles, onSelect, onAdd }: ProfilePickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-roku-dark z-[60] flex flex-col items-center justify-center p-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#3b0a64_0%,transparent_60%)] opacity-30 pointer-events-none"></div>

      <h1 className="text-6xl font-display font-medium mb-20 text-white tracking-tight z-10">Who's Watching?</h1>

      <div className="flex flex-wrap justify-center gap-16 z-10">
        {profiles.map((profile) => (
          <motion.button
            key={profile.id}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(profile)}
            className="flex flex-col items-center gap-8 group cursor-pointer"
          >
            <div className={`w-36 h-36 md:w-44 md:h-44 rounded-[40px] ${profile.avatar} flex items-center justify-center shadow-2xl border-[6px] border-transparent group-hover:border-white transition-all duration-300 relative`}>
               <User className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
               <div className="absolute inset-0 rounded-[34px] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow"></div>
            </div>
            <span className="text-2xl font-display font-semibold text-white/50 group-hover:text-white transition-colors">
              {profile.name}
            </span>
          </motion.button>
        ))}

        {profiles.length < 5 && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="flex flex-col items-center gap-8 group cursor-pointer"
          >
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-[40px] bg-white/5 border-[6px] border-dashed border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300">
               <Plus className="w-16 h-16 text-white/10" />
            </div>
            <span className="text-2xl font-display font-semibold text-white/10 group-hover:text-white transition-colors">
              Add Profile
            </span>
          </motion.button>
        )}
      </div>

      <button className="mt-32 px-10 py-3 rounded-full border border-white/10 text-white/30 font-bold text-sm tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all">
        Manage Profiles
      </button>
    </motion.div>
  );
}
