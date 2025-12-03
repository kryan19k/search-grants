"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { GrantCard } from "@/components/ui/grant-card";
import { GrantDetailModal } from "@/components/ui/grant-detail-modal";
import { mockGrants, Grant } from "@/data/mockGrants";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 5000000]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredGrants = useMemo(() => {
    return mockGrants.filter((grant) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        grant.title.toLowerCase().includes(searchLower) ||
        grant.organization.toLowerCase().includes(searchLower) ||
        grant.description.toLowerCase().includes(searchLower) ||
        grant.category.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(grant.category);

      // Amount filter
      const matchesAmount =
        grant.amount.min >= amountRange[0] && grant.amount.max <= amountRange[1];

      return matchesSearch && matchesCategory && matchesAmount;
    });
  }, [searchQuery, selectedCategories, amountRange]);

  const handleGrantClick = (grant: Grant) => {
    setSelectedGrant(grant);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setAmountRange([0, 5000000]);
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen text-white">
      <AnimatedBackground />
      <Navbar />

      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              amountRange={amountRange}
              onAmountChange={setAmountRange}
              onClearFilters={handleClearFilters}
            />

            <div className="flex-1">
              {/* Results header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">Available Grants</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Showing {filteredGrants.length} of {mockGrants.length} grants
                  </p>
                </div>
              </motion.div>

              {/* Grant grid */}
              <AnimatePresence mode="wait">
                {filteredGrants.length > 0 ? (
                  <motion.div
                    key="grants"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredGrants.map((grant, index) => (
                      <GrantCard
                        key={grant.id}
                        grant={grant}
                        index={index}
                        onClick={() => handleGrantClick(grant)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-20"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No grants found</h3>
                    <p className="text-slate-400 mb-6">
                      Try adjusting your search or filters to find more opportunities
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="text-violet-400 hover:text-violet-300 underline"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <GrantDetailModal
        grant={selectedGrant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}