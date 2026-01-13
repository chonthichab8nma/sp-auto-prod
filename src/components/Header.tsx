import React, { useState, useEffect, useRef, useMemo } from "react"; // 1. อย่าลืม import useMemo
import { Wrench, Search, Plus, X } from "lucide-react";
import { type Job } from "../Type";

interface HeaderProps {
  jobs: Job[];
  onJobSelect: (id: string) => void;
  onGoHome: () => void;
  onNewJob: () => void;
}

export default function Header({
  jobs = [],
  onJobSelect,
  onGoHome,
  onNewJob,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return jobs.filter((j) => {
      const reg = (j.registration || "").toLowerCase();
      const bag = (j.bagNumber || "").toLowerCase();
      return reg.includes(query) || bag.includes(query);
    });
  }, [searchQuery, jobs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    setShowDropdown(val.trim().length > 0);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onJobSelect(id);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onGoHome}
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Wrench size={20} />
          </div>
          <h1 className="text-xl font-bold text-blue-900 hidden md:block">
            Garage Pro
          </h1>
        </div>

        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา ทะเบียนรถ / เลขถัง..."
              className="w-full pl-10 pr-10 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
            />
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[60] max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    พบข้อมูล ({searchResults.length})
                  </div>
                  {searchResults.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => handleSelect(job.id)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-none flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-blue-700">
                          {job.registration || "ไม่ระบุทะเบียน"}
                        </div>
                        <div className="text-xs text-slate-500">
                          ถุง/ถัง: {job.bagNumber || "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  ไม่พบข้อมูล
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onNewJob}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">รับรถใหม่</span>
        </button>
      </div>
    </header>
  );
}
