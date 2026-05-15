import React, { useState } from "react";
import {
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useInterestBreakdown } from "../../hooks/useTransactions";

const InterestBreakdownModal = ({ isOpen, onClose }) => {
  const { data, isPending, isError } = useInterestBreakdown();

  if (!isOpen) return null;

  const breakdown = data?.data;
  const days = breakdown?.daily || [];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
    });
  };

  // Find max accrued for bar scaling
  const maxAccrued = Math.max(...days.map((d) => d.accruedAmount), 1);
  const activeDays = days.filter((d) => d.accruedAmount > 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Interest Breakdown
              </h2>
              <p className="text-sm text-slate-500">
                Daily accrual for{" "}
                {breakdown
                  ? new Date(breakdown.periodStart).toLocaleDateString(
                      "en-NG",
                      { month: "long", year: "numeric" },
                    )
                  : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Summary Cards */}
        {!isPending && !isError && breakdown && (
          <div className="grid grid-cols-3 gap-4 p-6 pb-0">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium mb-1">
                Total Accrued
              </p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(breakdown.totalAccrued)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">
                Active Days
              </p>
              <p className="text-lg font-bold text-blue-700">
                {activeDays.length} days
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-600 font-medium mb-1">Period</p>
              <p className="text-lg font-bold text-slate-700">
                {breakdown.days} days
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isPending ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center space-x-3 p-3 rounded-lg bg-slate-50"
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XMarkIcon className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-slate-500 text-sm">
                Failed to load interest breakdown
              </p>
            </div>
          ) : (
            <>
              {/* Bar Chart Visual */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Daily Accrual Chart
                </p>
                <div
                  className="relative bg-slate-50 rounded-xl px-3 pt-3 pb-2"
                  style={{ height: "80px" }}
                >
                  <div className="absolute inset-x-3 bottom-2 top-3 flex items-end gap-0.5">
                    {days.map((day) => {
                      const heightPct =
                        day.accruedAmount > 0
                          ? Math.max((day.accruedAmount / maxAccrued) * 100, 12)
                          : 5;
                      return (
                        <div
                          key={day.day}
                          className="relative flex-1 flex items-end group"
                          style={{ height: "100%" }}
                        >
                          <div
                            className={`w-full rounded-sm transition-colors duration-200 ${
                              day.accruedAmount > 0
                                ? "bg-green-400 hover:bg-green-500"
                                : "bg-slate-200"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          {day.accruedAmount > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                              {formatDate(day.applyDate)}:{" "}
                              {formatCurrency(day.accruedAmount)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">
                    {days.length > 0 ? formatDate(days[0].applyDate) : ""}
                  </span>
                  <span className="text-xs text-slate-400">
                    {days.length > 0
                      ? formatDate(days[days.length - 1].applyDate)
                      : ""}
                  </span>
                </div>
              </div>

              {/* Day-by-day list - only show days with activity */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Active Days
                </p>
                {activeDays.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    No interest accrued this period
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeDays.map((day) => (
                      <div
                        key={day.day}
                        className="flex items-center justify-between p-4 bg-slate-50 hover:bg-green-50 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                            <CalendarDaysIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {formatDate(day.applyDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            +{formatCurrency(day.accruedAmount)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Cumulative:{" "}
                            {formatCurrency(day.cumulativeAccruedAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestBreakdownModal;
