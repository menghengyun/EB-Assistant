import React from 'react';
import { SelectedItem } from '../types';
import { Trash2, Boxes } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PriceBreakdownTableProps {
  items: SelectedItem[];
  onRemove: (id: string) => void;
  onCheckInventory: (item: SelectedItem) => void;
  total: number;
}

export const PriceBreakdownTable: React.FC<PriceBreakdownTableProps> = ({ items, onRemove, onCheckInventory, total }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="mt-2">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="py-2 pl-3 pr-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-2 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="relative py-2 pl-2 pr-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-[10px] text-gray-400 italic">
                  No items selected.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="whitespace-nowrap py-2 pl-3 pr-2 text-xs">
                    <div className="flex flex-col">
                      <button
                        onClick={() => onCheckInventory(item)}
                        className="text-left font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px] hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-1 group"
                        title="View Stock Availability"
                      >
                        {item.sku}
                        <Boxes className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <span className="text-[9px] text-gray-400 uppercase">{item.type}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs text-gray-900 dark:text-gray-100 text-right tabular-nums font-medium">{formatCurrency(item.price)}</td>
                  <td className="relative whitespace-nowrap py-2 pl-2 pr-3 text-right text-xs font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onCheckInventory(item)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-0.5"
                        title="Check Inventory"
                      >
                        <Boxes className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
