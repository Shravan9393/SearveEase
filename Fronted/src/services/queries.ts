import { api } from "./api";

export interface QueryMessage {
  _id: string;
  senderType: "customer" | "provider";
  senderId?: { _id: string; fullName?: string; profileImage?: string; role?: string };
  message: string;
  createdAt: string;
}

export interface ServiceQuery {
  _id: string;
  serviceId: { _id: string; title: string };
  providerProfileId: { _id: string; displayName?: string; profileImage?: string };
  customerProfileId: { _id: string; fullName?: string; profileImage?: string };
  messages: QueryMessage[];
  status: "open" | "answered" | "closed";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export const queriesAPI = {
  createQuery: async (data: {
    serviceId: string;
    providerId: string;
    customerId: string;
    message: string;
  }) => {
    const response = await api.post("/queries", data);
    return response.data.data as ServiceQuery;
  },

  getProviderQueries: async () => {
    const response = await api.get("/queries/provider");
    return response.data.data as { queries: ServiceQuery[] };
  },

  getCustomerQueries: async () => {
    const response = await api.get("/queries/customer");
    return response.data.data as { queries: ServiceQuery[] };
  },

  replyToQuery: async (queryId: string, message: string) => {
    const response = await api.post(`/queries/${queryId}/reply`, { message });
    return response.data.data as ServiceQuery;
  },

  replyToCustomerQuery: async (queryId: string, message: string) => {
    const response = await api.post(`/queries/${queryId}/customer-reply`, { message });
    return response.data.data as ServiceQuery;
  },
};

export default queriesAPI;
