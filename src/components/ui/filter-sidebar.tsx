"use client";

import { motion } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";

// Categories matching Grants.gov API funding_categories
// Maps display name to API value
const categories = [
  { label: "Health", value: "health" },
  { label: "Education", value: "education" },
  { label: "Environment", value: "environment" },
  { label: "Science & Research", value: "science_technology_and_other_research_and_development" },
  { label: "Social Services", value: "income_security_and_social_services" },
  { label: "Community Development", value: "community_development" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Transportation", value: "transportation" },
  { label: "Energy", value: "energy" },
  { label: "Employment & Training", value: "employment_labor_and_training" },
  { label: "Arts & Humanities", value: "humanities" },
  { label: "Food & Nutrition", value: "food_and_nutrition" },
  { label: "Natural Resources", value: "natural_resources" },
  { label: "Other", value: "other" },
];

interface FilterSidebarProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  amountRange: [number, number];
  onAmountChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  selectedCategories,
  onCategoryChange,
  amountRange,
  onAmountChange,
  onClearFilters,
}: FilterSidebarProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || amountRange[0] > 0 || amountRange[1] < 100000000;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full lg:w-72 flex-shrink-0"
    >
      <div className="sticky top-24 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-400 hover:text-white text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategories.includes(category.value) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCategories.includes(category.value)
                    ? "bg-violet-600 hover:bg-violet-500 text-white border-violet-600"
                    : "border-slate-600 text-slate-400 hover:border-violet-500 hover:text-violet-400"
                }`}
                onClick={() => toggleCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Funding Amount</h3>
          </div>
          <div className="px-2">
            <Slider
              value={amountRange}
              min={0}
              max={100000000}
              step={100000}
              onValueChange={(value) => onAmountChange(value as [number, number])}
              className="mb-4"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{formatCurrency(amountRange[0])}</span>
              <span className="text-slate-400">{formatCurrency(amountRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Active filters count */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-4 border-t border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Active filters</span>
              <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30">
                {selectedCategories.length + (amountRange[0] > 0 || amountRange[1] < 100000000 ? 1 : 0)}
              </Badge>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}