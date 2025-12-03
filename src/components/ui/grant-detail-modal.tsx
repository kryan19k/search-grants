"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  FileText,
  ExternalLink,
  Sparkles 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grant } from "@/lib/grants-api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface GrantDetailModalProps {
  grant: Grant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GrantDetailModal({ grant, isOpen, onClose }: GrantDetailModalProps) {
  if (!grant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-violet-600 text-white">{grant.category}</Badge>
              {grant.featured && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold text-white pr-8">
              {grant.title}
            </DialogTitle>
            <div className="flex items-center gap-2 text-slate-300 mt-2">
              <Building2 className="w-4 h-4" />
              <span>{grant.organization}</span>
            </div>
          </DialogHeader>

          {/* Match score */}
          <div className="absolute top-6 right-6">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#modalGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${grant.matchPercentage * 1.76} 176` }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="modalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{grant.matchPercentage}%</span>
                <span className="text-[10px] text-slate-400">Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key info cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                Funding Amount
              </div>
              <div className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {grant.amount.max > 0 ? (
                  grant.amount.min > 0 && grant.amount.min !== grant.amount.max
                    ? `${formatCurrency(grant.amount.min)} - ${formatCurrency(grant.amount.max)}`
                    : formatCurrency(grant.amount.max)
                ) : (
                  <span className="text-slate-400">See Details</span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Application Deadline
              </div>
              <div className="text-lg font-semibold text-white">
                {formatDate(grant.deadline)}
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
            <p className="text-slate-300 leading-relaxed">{grant.description}</p>
          </motion.div>

          {/* Eligibility */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-slate-400 mb-3">Eligibility</h3>
            <div className="space-y-2">
              {grant.eligibility.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-medium text-slate-400 mb-3">Requirements</h3>
            <div className="space-y-2">
              {grant.requirements.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
              onClick={() => window.open(grant.applicationUrl, '_blank')}
            >
              Apply on Grants.gov
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}