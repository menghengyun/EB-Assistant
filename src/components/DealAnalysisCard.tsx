import React from 'react';
import { DealComparison } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DealAnalysisCardProps {
  comparison: DealComparison;
}

export const DealAnalysisCard: React.FC<DealAnalysisCardProps> = ({ comparison }) => {
  const { customerOffer, minPrice, difference, margin, status, recommendation } = comparison;

  const isPositive = difference > 0;
  const isNeutral = difference === 0;

  const statusColors = {
    ACCEPTABLE: "bg-green-50 text-green-800 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    BELOW_MINIMUM: "bg-red-50 text-red-800 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    EXACT: "bg-yellow-50 text-yellow-800 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  };

  const StatusIcon = () => {
    if (status === 'ACCEPTABLE') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'BELOW_MINIMUM') return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-3">
      <div className={cn(
        "p-2.5 rounded-lg border flex items-center gap-3 transition-colors",
        statusColors[status]
      )}>
        <StatusIcon />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide">
            {status === 'ACCEPTABLE' ? 'Acceptable' : 
             status === 'BELOW_MINIMUM' ? 'Below Minimum' : 
             'Exact Match'}
          </h3>
          <p className="text-[10px] opacity-80 leading-tight">
            {recommendation === 'ACCEPT' ? 'Meets margin requirements.' :
             recommendation === 'REJECT' ? 'Below cost floor.' :
             'Absolute break-even.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Difference</p>
          <p className={cn(
            "text-sm font-bold",
            isPositive ? "text-green-600 dark:text-green-400" : 
            isNeutral ? "text-yellow-600 dark:text-yellow-400" : 
            "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? '+' : ''}{formatCurrency(difference)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Margin</p>
          <p className={cn(
            "text-sm font-bold",
            isPositive ? "text-green-600 dark:text-green-400" : 
            isNeutral ? "text-yellow-600 dark:text-yellow-400" : 
            "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? '+' : ''}{margin.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};
