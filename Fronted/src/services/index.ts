export { api, default as axios } from './api';
export { authAPI, setTokens, getTokens, clearTokens, setUser, getUser } from './auth';
export type { User, AuthResponse, LoginCredentials, RegisterCustomerData, RegisterProviderData } from './auth';

export { servicesAPI } from './services';
export type { Service, ServiceQueryParams } from './services';

export { categoriesAPI } from './categories';
export type { Category } from './categories';

export { bookingsAPI } from './bookings';
export type { Booking, CreateBookingData } from './bookings';
