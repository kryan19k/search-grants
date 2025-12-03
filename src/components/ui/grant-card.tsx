"use client";

import { motion } from "framer-motion";
import { Calendar, Building2, ArrowRight, Sparkles, ExternalLink, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grant } from "@/lib/grants-api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface GrantCardProps {
  grant: Grant;
  index: number;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  Health: "from-rose-500 to-pink-500",
  Education: "from-amber-500 to-orange-500",
  Environment: "from-emerald-500 to-green-500",
  "Science & Research": "from-teal-500 to-cyan-500",
  "Social Services": "from-indigo-500 to-blue-500",
  "Community Development": "from-purple-500 to-violet-500",
  Agriculture: "from-lime-500 to-green-500",
  Transportation: "from-gray-500 to-slate-500",
  Energy: "from-yellow-500 to-orange-500",
  "Employment & Training": "from-blue-500 to-indigo-500",
  "Arts & Humanities": "from-pink-500 to-purple-500",
  "Food & Nutrition": "from-green-500 to-emerald-500",
  "Natural Resources": "from-cyan-500 to-teal-500",
  Other: "from-slate-500 to-slate-600",
};

export function GrantCard({ grant, index, onClick }: GrantCardProps) {
  const gradientColor = categoryColors[grant.category] || "from-slate-500 to-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card 
        className="relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer h-full"
        onClick={onClick}
      >
        {/* Gradient top border */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor}`} />
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className={`bg-gradient-to-r ${gradientColor} text-white border-0 text-xs`}
                >
                  {grant.category}
                </Badge>
                {grant.featured && (
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                {grant.title}
              </h3>
            </div>
            
            {/* Match percentage */}
            <div className="flex-shrink-0">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-700"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 150" }}
                    animate={{ strokeDasharray: `${grant.matchPercentage * 1.5} 150` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{grant.matchPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
            <Building2 className="w-4 h-4" />
            <span>{grant.organization}</span>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {grant.description}
          </p>

          {/* Funding & Deadline */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <DollarSign className="w-3 h-3" />
                Award Amount
              </div>
              {grant.amount.max > 0 ? (
                <div className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {grant.amount.min > 0 && grant.amount.min !== grant.amount.max 
                    ? `${formatCurrency(grant.amount.min)} - ${formatCurrency(grant.amount.max)}`
                    : formatCurrency(grant.amount.max)
                  }
                </div>
              ) : (
                <div className="text-sm text-slate-400">See Details</div>
              )}
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                Deadline
              </div>
              <div className="text-sm font-medium text-white">
                {grant.deadline && grant.deadline !== "Open" && grant.deadline !== "" 
                  ? formatDate(grant.deadline)
                  : <span className="text-emerald-400">Open</span>
                }
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant="ghost" 
              className="flex-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 group/btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
              onClick={(e) => {
                e.stopPropagation();
                window.open(grant.applicationUrl, '_blank');
              }}
            >
              Apply Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}