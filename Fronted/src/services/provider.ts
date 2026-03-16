import { api } from './api';

export interface ProviderDashboardData {
  provider: {
    displayName: string;
    businessName: string;
    profileImage: string;
    verified: boolean;
    category: string;
    userName: string;
  };
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    profileViews: number;
    viewsGrowth: number;
    completedServices: number;
    servicesGrowth: number;
    activeBookings: number;
    pendingBookings: number;
    rating: number;
    responseRate: number;
    completionRate: number;
  };
  revenueData: { month: string; revenue: number; bookings: number }[];
  activityData: { day: string; queries: number; bookings: number }[];
  services: {
    id: string;
    service: string;
    price: string;
    bookings: number;
    revenue: string;
    status: string;
    views: number;
    rating: number;
    categoryName: string;
    pricing: number;
  }[];
  priceComparison: {
    category: string;
    yourPrice: string;
    avgMarketPrice: string;
    lowestPrice: string;
    highestPrice: string;
    marketPosition: string;
  }[];
}

export const providerAPI = {
  getProviderDashboard: async (): Promise<ProviderDashboardData> => {
    const response = await api.get('/providers/dashboard');
    return response.data.data;
  },
};

export default providerAPI;
