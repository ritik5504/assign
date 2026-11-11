import { Role, BusType, BusStatus, OperatorStatus, SeatType, SeatStatus, TripStatus, BookingStatus, RefundStatus, Gender } from "@prisma/client";

export type { Role, BusType, BusStatus, OperatorStatus, SeatType, SeatStatus, TripStatus, BookingStatus, RefundStatus, Gender };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}

export interface TripSearchResult {
  id: string;
  busId: string;
  busName: string;
  busType: BusType;
  registrationNumber: string;
  operatorName: string;
  amenities: string[];
  routeId: string;
  source: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
  departureDateTime: string;
  arrivalDateTime: string;
  baseFare: number;
  status: TripStatus;
  availableSeatsCount: number;
  totalSeats: number;
  stops: {
    stopId: string;
    stopName: string;
    city: string;
    stopOrder: number;
    arrivalOffset: number;
    departureOffset: number;
  }[];
}

export interface SeatWithStatus {
  id: string;
  seatId: string;
  seatNumber: string;
  seatType: SeatType;
  row: number;
  column: number;
  status: SeatStatus;
  lockedUntil?: string | null;
  fare: number;
}

