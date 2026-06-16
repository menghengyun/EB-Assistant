export interface SKU {
  sku: string;
  price: number;
}

export interface SKUData {
  machines: SKU[];
  attachments: SKU[];
}

export type ItemType = 'Machine' | 'Attachment';

export interface SelectedItem extends SKU {
  type: ItemType;
  id: string; // Unique ID for list rendering
}

export interface DealComparison {
  customerOffer: number;
  minPrice: number;
  difference: number;
  margin: number;
  status: 'ACCEPTABLE' | 'BELOW_MINIMUM' | 'EXACT';
  recommendation: 'ACCEPT' | 'REJECT' | 'CONSIDER';
}
