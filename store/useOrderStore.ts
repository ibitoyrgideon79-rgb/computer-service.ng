import { create } from 'zustand';

export interface ScheduledStop {
  address: string;
  state: string;
  date: string;
  time: string;
}

export interface OrderData {
  // Service (from homepage form)
  service: string;
  category: string;

  // Personal Details
  name: string;
  phoneNumber: string;
  email: string;

  // Document
  document: File | null;
  documents: File[];
  documentText: string;
  customDocumentHtml?: string;

  // Options
  checkFormatting: boolean;
  printColor: 'Black & white' | 'Coloured' | '';
  paperType: 'A4' | 'A3' | 'Custom type' | '';
  customPaperType?: string;
  copies: number;
  pages?: number;
  expressService?: boolean;
  otherCategory?: string;
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
  deliveryMethod: 'Express Delivery' | 'Standard Delivery' | 'Economy Delivery' | 'Schedule Delivery' | 'Special Submission' | 'Hardcopy Pickup' | '';
  scheduledStops?: ScheduledStop[];
  specificInstruction: string;
  deadline: 'Standard (3hrs - 5hrs)' | 'Express (1hr - 2hrs)' | 'Custom (Date Picker)' | '';
  customDeadlineDate?: string;
  deliveryDetails: string;

  // Pick Up / Doorstep address
  pickupState: string;
  pickupCity: string;
  pickupLocation: string;
  pickupContactName: string;
  pickupContactPhone: string;

  // Hardcopy Pickup
  hardcopyPickupDate: string;
  hardcopyPickupTime: string;
  hardcopyState: string;
  hardcopyCity: string;
  hardcopyContactName: string;
  hardcopyCompany: string;
  hardcopyContactPhone: string;
  hardcopyDocCount: string;
  hardcopyDocMode: "known" | "unsure" | "custom" | "";
  hardcopyCustomDesc: string;
  hardcopyInstructions: string;

  // Approval flow
  submittedOrderId: string;
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
  pickupLocation: '',
  pickupContactName: '',
  pickupContactPhone: '',
};

const STORAGE_KEY = 'computerservice_order_data';

export const useOrderStore = create<OrderStore>((set, get) => ({
  orderData: defaultState,

  setOrderData: (data) => {
    set((state) => ({ orderData: { ...state.orderData, ...data } }));
    setTimeout(() => get().saveToLocalStorage(), 0);
  },

  resetOrder: () => set({ orderData: defaultState }),

  saveToLocalStorage: () => {
    const { orderData } = get();
    const dataToSave = {
      ...orderData,
      document: null,
      documents: [],
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
