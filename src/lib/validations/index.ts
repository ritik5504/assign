import { z } from "zod";
import { BusType, BusStatus, OperatorStatus, Gender, SeatType, TripStatus } from "@prisma/client";

// Auth validations
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  phone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Passenger and Booking validations
export const passengerSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(60),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Invalid age"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"] as const),
  phone: z.string().optional().nullable(),
});

export const lockSeatsSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  seatIds: z.array(z.string().uuid("Invalid seat ID")).min(1, "At least one seat must be selected").max(6, "Maximum 6 seats per booking"),
});

export const createBookingSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  seatIds: z.array(z.string().uuid("Invalid seat ID")).min(1, "At least one seat must be selected").max(6, "Maximum 6 seats per booking"),
  passengers: z.array(passengerSchema).min(1, "At least one passenger required"),
  idempotencyKey: z.string().optional(),
}).refine((data) => data.seatIds.length === data.passengers.length, {
  message: "The number of passengers must match the number of selected seats",
  path: ["passengers"],
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(3, "Please provide a valid cancellation reason").max(300),
});

// Bus schema
export const busSchema = z.object({
  operatorId: z.string().uuid("Valid operator is required"),
  registrationNumber: z.string().min(3).max(20),
  busName: z.string().min(2).max(60),
  busType: z.nativeEnum(BusType),
  totalSeats: z.coerce.number().int().min(10).max(60),
  amenities: z.array(z.string()).default([]),
  status: z.nativeEnum(BusStatus).default(BusStatus.ACTIVE),
});

// Route schema
export const routeSchema = z.object({
  source: z.string().min(2).max(60),
  destination: z.string().min(2).max(60),
  distance: z.coerce.number().positive("Distance must be positive"),
  estimatedDuration: z.coerce.number().int().positive("Duration must be in minutes"),
  stops: z.array(
    z.object({
      stopId: z.string().uuid(),
      stopOrder: z.coerce.number().int().positive(),
      arrivalOffset: z.coerce.number().int().min(0),
      departureOffset: z.coerce.number().int().min(0),
    })
  ).optional().default([]),
});

// Stop schema
export const stopSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(60),
  address: z.string().min(5).max(200),
});

// Trip schema
export const tripSchema = z.object({
  busId: z.string().uuid("Select a bus"),
  routeId: z.string().uuid("Select a route"),
  departureDateTime: z.string().or(z.date()),
  arrivalDateTime: z.string().or(z.date()),
  baseFare: z.coerce.number().positive("Base fare must be positive"),
  status: z.nativeEnum(TripStatus).default(TripStatus.SCHEDULED),
});

// Operator schema
export const operatorSchema = z.object({
  name: z.string().min(2).max(100),
  contactDetails: z.string().min(5).max(200),
  status: z.nativeEnum(OperatorStatus).default(OperatorStatus.ACTIVE),
});

