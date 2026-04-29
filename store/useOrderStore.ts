import { create } from 'zustand';

export interface OrderData {
  // Personal Details
  name: string;
  phoneNumber: string;
  email: string;
  
  // Document
  document: File | null;
  documentText: string;
  customDocumentHtml?: string;
  
  // Options
  checkFormatting: boolean;
  printColor: 'Black & white' | 'Coloured' | '';
  paperType: 'A4' | 'A3' | 'Custom type' | '';
  customPaperType?: string;
  copies: number;
  printLayout: 'Single Sided' | 'Double Sided' | '';
  pageSelection: 'Print all pages' | 'Specify Pages' | '';
  specificPages?: string;
  orientation: 'Landscape' | 'Portrait' | 'Auto' | '';
  finishingOption: 'None' | 'Spiral Binding' | 'Stapled' | 'Hardcover Binding' | '';
  
  // Binding Details
  bindingType: 'Spiral' | 'Comb' | 'Hard Cover' | '';
  frontCover: 'Transparent' | 'Designed Cover' | 'Use first page' | '';
  backCover: 'Plain' | 'Cardboard' | '';
  
  // Delivery
  deliveryMethod: 'Pick Up' | 'Doorstep' | '';
  specificInstruction: string;
  deadline: 'Standard(24 -48 hours)' | 'Expresss ( same day)' | 'Customer (Date Picker)' | '';
  customDeadlineDate?: string;
  deliveryDetails: string;
}

interface OrderStore {
  orderData: Partial<OrderData>;
  setOrderData: (data: Partial<OrderData>) => void;
  resetOrder: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const defaultState: Partial<OrderData> = {
  checkFormatting: false,
  copies: 1,
};

const STORAGE_KEY = 'computerservice_order_data';

export const useOrderStore = create<OrderStore>((set, get) => ({
  orderData: defaultState,
  
  setOrderData: (data) => {
    set((state) => ({ orderData: { ...state.orderData, ...data } }));
    // Auto-save to localStorage whenever data changes
    setTimeout(() => get().saveToLocalStorage(), 0);
  },
  
  resetOrder: () => set({ orderData: defaultState }),
  
  saveToLocalStorage: () => {
    const { orderData } = get();
    const dataToSave = {
      ...orderData,
      document: null, // Don't save File objects
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  },
  
  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set({ orderData: { ...defaultState, ...data } });
      } catch (error) {
        console.error('Failed to load order data:', error);
      }
    }
  },
}));
