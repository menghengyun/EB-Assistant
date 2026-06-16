import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Calculator, RefreshCcw } from 'lucide-react';
import { Autocomplete } from './components/Autocomplete';
import { DealAnalysisCard } from './components/DealAnalysisCard';
import { PriceBreakdownTable } from './components/PriceBreakdownTable';
import { SKU, SKUData, SelectedItem, DealComparison } from './types';
import skuDataImport from './data/skus.json';

const skuData = skuDataImport as SKUData;

const NOTION_STOCKS_URL = 'https://app.notion.com/p/typhonmachinery/STOCKS-3c87d201086e4295841fde6b53b7d0c4';
const NOTION_INCOMING_URL = 'https://app.notion.com/p/typhonmachinery/Incoming-Machines-assigned-a4a3bb316862442dba8f5fa6639eec79';

// Helper to handle Chrome storage with fallback for development
const storage = {
  get: (keys: string[], callback: (result: any) => void) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback);
    } else {
      const result: any = {};
      keys.forEach(key => {
        const val = localStorage.getItem(`typhon_${key}`);
        result[key] = val ? JSON.parse(val) : undefined;
      });
      callback(result);
    }
  },
  set: (data: any) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(data);
    } else {
      Object.entries(data).forEach(([key, val]) => {
        localStorage.setItem(`typhon_${key}`, JSON.stringify(val));
      });
    }
  },
  remove: (keys: string[]) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(keys);
    } else {
      keys.forEach(key => localStorage.removeItem(`typhon_${key}`));
    }
  }
};

function App() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customerOfferInput, setCustomerOfferInput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state on startup
  useEffect(() => {
    storage.get(['selectedItems', 'customerOffer'], (result) => {
      if (result.selectedItems) setSelectedItems(result.selectedItems);
      if (result.customerOffer) setCustomerOfferInput(result.customerOffer);
      setIsInitialized(true);
    });
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (isInitialized) {
      storage.set({
        selectedItems,
        customerOffer: customerOfferInput
      });
    }
  }, [selectedItems, customerOfferInput, isInitialized]);

  const minPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  }, [selectedItems]);

  const customerOffer = parseFloat(customerOfferInput) || 0;

  const comparison = useMemo((): DealComparison => {
    const difference = customerOffer - minPrice;
    const margin = customerOffer > 0 ? (difference / minPrice) * 100 : 0;
    
    let status: DealComparison['status'] = 'EXACT';
    let recommendation: DealComparison['recommendation'] = 'CONSIDER';

    if (difference > 0) {
      status = 'ACCEPTABLE';
      recommendation = 'ACCEPT';
    } else if (difference < 0) {
      status = 'BELOW_MINIMUM';
      recommendation = 'REJECT';
    }

    return {
      customerOffer,
      minPrice,
      difference,
      margin,
      status,
      recommendation
    };
  }, [customerOffer, minPrice]);

  const handleAddMachine = (sku: SKU) => {
    const newItems = selectedItems.filter(item => item.type !== 'Machine');
    setSelectedItems([{ ...sku, type: 'Machine', id: `m-${Date.now()}` }, ...newItems]);
  };

  const handleAddAttachment = (sku: SKU) => {
    setSelectedItems([...selectedItems, { ...sku, type: 'Attachment', id: `a-${Date.now()}-${Math.random()}` }]);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleCheckInventory = (item: SelectedItem) => {
    // Send message to background script to handle split-screen/windows
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'OPEN_INVENTORY',
        sku: item.sku,
        isMachine: item.type === 'Machine'
      });
    } else {
      // Fallback for dev environment
      window.open(NOTION_STOCKS_URL, '_blank');
      if (item.type === 'Machine') {
        window.open(NOTION_INCOMING_URL, '_blank');
      }
    }
  };

  const handleCopySummary = async () => {
    const machine = selectedItems.find(i => i.type === 'Machine');
    const attachments = selectedItems.filter(i => i.type === 'Attachment');
    const format = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const summary = `Machine:
${machine?.sku || 'None'}

Attachments:
${attachments.map(a => a.sku).join('\n') || 'None'}

Our Minimum Price:
${format(minPrice)}

Customer Offer:
${format(customerOffer)}

Difference:
${comparison.difference >= 0 ? '+' : ''}${format(comparison.difference)}

Status:
${comparison.status === 'ACCEPTABLE' ? 'ACCEPTABLE OFFER' : comparison.status === 'BELOW_MINIMUM' ? 'BELOW MINIMUM PRICE' : 'EXACT MINIMUM PRICE'}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedItems([]);
    setCustomerOfferInput('');
    storage.remove(['selectedItems', 'customerOffer']);
  };

  if (!isInitialized) return null; // Prevent flicker on load

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <header className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded shadow-lg shadow-blue-500/20">
            <Calculator className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">Typhon Checker</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Internal Sales Tool</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <RefreshCcw className="h-3 w-3" />
          Reset
        </button>
      </header>

      <main className="flex flex-col gap-4 max-w-2xl mx-auto">
        <section className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[10px]">1</span>
              Build Our Price
            </h2>

            <div className="space-y-4">
              <Autocomplete
                label="Machine SKU"
                options={skuData.machines}
                onSelect={handleAddMachine}
                placeholder="Search machine..."
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Attachments</label>
                <Autocomplete
                  options={skuData.attachments}
                  onSelect={handleAddAttachment}
                  placeholder="Add attachment..."
                  className="flex-1"
                  clearOnSelect
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest">
                    <span>Machine</span>
                    <span>${(selectedItems.find(i => i.type === 'Machine')?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest">
                    <span>Attachments</span>
                    <span>${selectedItems.filter(i => i.type === 'Attachment').reduce((s, i) => s + i.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-100 dark:border-blue-800/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Minimum Price:</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-[10px]">2</span>
              Customer Offer
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    placeholder="Enter customer offer"
                    value={customerOfferInput}
                    onChange={(e) => setCustomerOfferInput(e.target.value)}
                  />
                </div>
              </div>

              <DealAnalysisCard comparison={comparison} />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selection</h2>
            <button
              onClick={handleCopySummary}
              disabled={selectedItems.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-bold text-xs hover:bg-gray-800 dark:hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Deal'}
            </button>
          </div>
          <PriceBreakdownTable 
            items={selectedItems} 
            onRemove={handleRemoveItem} 
            onCheckInventory={handleCheckInventory}
            total={minPrice} 
          />
        </section>
      </main>
    </div>
  );
}

export default App;
