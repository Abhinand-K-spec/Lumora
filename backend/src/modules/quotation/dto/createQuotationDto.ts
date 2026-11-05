export interface CreateQuotationItemDTO {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface CreateQuotationDTO {
    items: CreateQuotationItemDTO[];
    discount?: number;
    tax?: number;
    advanceAmount: number;
    validUntil: string;
    notes?: string;
  }