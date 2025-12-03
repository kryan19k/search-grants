"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FilterSidebar } from "@/components/ui/filter-sidebar";
import { GrantCard } from "@/components/ui/grant-card";
import { GrantDetailModal } from "@/components/ui/grant-detail-modal";
import { useGrants, Grant } from "@/hooks/useGrants";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000000]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    grants,
    loading,
    error,
    totalCount,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    setFilters,
    nextPage,
    previousPage,
    refresh,
  } = useGrants({ limit: 12 });

  // Debounce search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when search or categories change
  useEffect(() => {
    setFilters({
      keyword: debouncedSearch,
      categories: selectedCategories,
    });
  }, [debouncedSearch, selectedCategories, setFilters]);

  // Filter grants client-side for amount only (API handles keyword and category)
  const filteredGrants = useMemo(() => {
    return grants.filter((grant) => {
      // Amount filter (client-side since API doesn't support it well)
      const grantMax = grant.amount.max || 0;
      const grantMin = grant.amount.min || 0;
      
      // If grant has no amount info, include it
      if (grantMax === 0 && grantMin === 0) return true;
      
      // Check if grant amount overlaps with filter range
      return grantMax >= amountRange[0] && grantMin <= amountRange[1];
    });
  }, [grants, amountRange]);

  const handleGrantClick = (grant: Grant) => {
    setSelectedGrant(grant);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setAmountRange([0, 100000000]);
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Available Grants</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {loading ? (
                      "Loading grants..."
                    ) : (
                      <>
                        Showing {filteredGrants.length} of {totalCount.toLocaleString()} grants
                        {searchQuery && ` for "${searchQuery}"`}
                      </>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </motion.div>

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  <p>Error loading grants: {error}</p>
                  <button
                    onClick={refresh}
                    className="mt-2 text-sm underline hover:text-red-300"
                  >
                    Try again
                  </button>
                </motion.div>
              )}

              {/* Loading state */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                  <p className="text-slate-400">Fetching grants from Grants.gov...</p>
                </motion.div>
              )}

              {/* Grant grid */}
              {!loading && (
                <AnimatePresence mode="wait">
                  {filteredGrants.length > 0 ? (
                    <motion.div
                      key="grants"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredGrants.map((grant, index) => (
                          <GrantCard
                            key={grant.id}
                            grant={grant}
                            index={index}
                            onClick={() => handleGrantClick(grant)}
                          />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={previousPage}
                          disabled={!hasPreviousPage}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-slate-400 text-sm">
                          Page {currentPage} of {Math.ceil(totalCount / 12)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={!hasNextPage}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
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
              )}
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