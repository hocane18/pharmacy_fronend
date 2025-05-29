export interface Quotation {
  id?: number;
  customerId: number;
  userId: number;
  totalAmount: number;
  taxRate?: number;
  invoiceNo: string;
  purchaseDate: Date;
  items: QuotationItem[];
}

export interface QuotationItem {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: Date;
}
