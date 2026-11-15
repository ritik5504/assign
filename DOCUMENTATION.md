# Bus Booking Management System — System Architecture & Workflow Guide

A production-minded, full-stack Bus Booking Management System built with Next.js 15 (App Router), TypeScript, PostgreSQL, Prisma ORM, and Tailwind CSS.

---

## 1. System Architecture & High-Level Design

The application follows a **modular monolithic architecture** with strict separation of concerns across presentation, API, service, and database layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   Passenger Portal (Landing, Search, Interactive Layout, My Bookings) │
│   Admin / Operator Dashboard (Buses, Routes, Trips, Manifests, Reports)│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / JSON / Route Handlers
┌──────────────────────────────────▼─────────────────────────────────────┐
│                     API & CONTROLLER LAYER                             │
│   /api/auth/*     /api/trips/*     /api/bookings/*     /api/admin/*    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Zod Schema Validation & RBAC Guard
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    BUSINESS LOGIC / SERVICE LAYER                      │
│   booking.service.ts   cancellation.service.ts   report.service.ts     │
│   - Atomic Seat Locks (PostgreSQL Tx + Version Checks)                 │
│   - Idempotency & Conflict Guards (PNR Generation)                     │
│   - Tiered Departure Refund Calculation Engine                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Prisma Client (Prepared Queries)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    DATABASE / PERSISTENCE LAYER                        │
│   PostgreSQL: Normalized Models, Row-level Versioning, Unique Index   │
│   [User, Bus, Seat, Route, RouteStop, Trip, TripSeat, Booking, ...]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core End-to-End Workflows

### 2.1 The Complete Booking Lifecycle (Passenger)
The application guarantees concurrency safety using an atomic lifecycle:
`AVAILABLE` $\rightarrow$ `LOCKED` (5-minute window) $\rightarrow$ `BOOKED`.

```mermaid
sequenceDiagram
    autonumber
    actor Passenger
    participant UI as Passenger Portal
    participant API as /api/trips/... & /api/bookings
    participant LockEngine as Booking Service (Tx)
    participant DB as PostgreSQL Database

    Passenger->>UI: Select Origin, Destination & Date
    UI->>API: GET /api/trips/search?source=...&destination=...
    API->>DB: Query trips with route & stop match
    DB-->>API: Return scheduled trips & live seat counts
    API-->>UI: Display matching buses & fares

    Passenger->>UI: Pick Bus & Click "Select Seats"
    UI->>API: GET /api/trips/[id]/seats
    API->>DB: Fetch seat inventory (AVAILABLE / LOCKED / BOOKED)
    DB-->>API: Return seat layout & states
    API-->>UI: Render interactive 2D Seater/Sleeper map

    Passenger->>UI: Select Seats (e.g., 2A, 2B) & proceed
    UI->>API: POST /api/trips/[id]/seats/lock { seatIds: [...] }
    API->>LockEngine: Execute lockSeats(tripId, seatIds)
    
    rect rgb(240, 253, 244)
    Note over LockEngine,DB: Atomic PostgreSQL Transaction
    LockEngine->>DB: Check if any seat is already BOOKED or LOCKED (< now)
    alt Any Seat Not Available
        DB-->>LockEngine: Conflict detected
        LockEngine-->>API: 409 Conflict Error
        API-->>UI: Alert: "Seat already taken. Please pick another."
    else All Seats Available
        LockEngine->>DB: UPDATE TripSeat SET status='LOCKED', lockedUntil=NOW()+5min, version=version+1
        DB-->>LockEngine: 2 seats locked successfully
        LockEngine-->>API: { lockedSeatIds, lockExpiresAt }
        API-->>UI: Lock confirmed (5-minute countdown starts)
    end
    end

    Passenger->>UI: Fill Passenger Details (Name, Age, Gender, Phone)
    UI->>API: POST /api/bookings { tripId, seatIds, passengers, idempotencyKey }
    API->>LockEngine: Execute createBooking(payload)

    rect rgb(238, 242, 255)
    Note over LockEngine,DB: Atomic Final Checkout Transaction
    LockEngine->>DB: Verify locked seats belong to current transaction
    LockEngine->>DB: INSERT Booking (Generate Unique PNR)
    LockEngine->>DB: INSERT Passengers & BookingSeats
    LockEngine->>DB: UPDATE TripSeat SET status='BOOKED', lockedUntil=NULL
    LockEngine->>DB: INSERT AuditLog (BOOKING_CREATED)
    DB-->>LockEngine: Transaction committed
    end

    LockEngine-->>API: Confirmed Booking Payload with PNR
    API-->>UI: Redirect to /booking/confirmation/[pnr]
    UI-->>Passenger: Render Boarding Pass & E-Ticket (Printable/Downloadable)
```

---

### 2.2 Dynamic Cancellation & Refund Workflow
Cancellations calculate dynamic refunds based on hours remaining before departure:

```mermaid
flowchart TD
    Start([Passenger Requests Cancellation]) --> AuthCheck{Is User Authorized?}
    AuthCheck -- No --> Deny[403 Forbidden]
    AuthCheck -- Yes --> FetchBooking[Fetch Booking by ID]
    
    FetchBooking --> CheckStatus{Status == CONFIRMED?}
    CheckStatus -- No --> Reject[Cannot cancel already cancelled/failed ticket]
    CheckStatus -- Yes --> CalcHours[Calculate hours remaining before departure]
    
    CalcHours --> MatchPolicy[Query CancellationPolicy table]
    MatchPolicy --> CalcAmounts["Refund Amount = Total Fare × (Refund % / 100)<br>Cancellation Fee = Total Fare - Refund Amount"]
    
    CalcAmounts --> Tx[Begin PostgreSQL Transaction]
    subgraph Atomic DB Operations
        Tx --> UpdateBooking["Set Booking.status = CANCELLED"]
        UpdateBooking --> ReleaseSeats["Set TripSeats.status = AVAILABLE<br>TripSeats.lockedUntil = NULL"]
        ReleaseSeats --> CreateCancellation["Insert Cancellation Record<br>(Reason, Fee, RefundAmount, Status: COMPLETED)"]
        CreateCancellation --> Audit["Insert AuditLog (BOOKING_CANCELLED)"]
    end
    
    Audit --> Commit[Commit Transaction]
    Commit --> Response([Return Cancellation Confirmation & Refund Breakdown])
```

---

### 2.3 Real-Time Fleet & Admin Synchronization
Bookings and cancellations immediately update administrative screens without manual refreshes:

```mermaid
flowchart LR
    subgraph CustomerPortal["Passenger Operations"]
        B[New Ticket Booked]
        C[Ticket Cancelled]
    end

    subgraph Database["PostgreSQL (Transactional Truth)"]
        DB[(Bookings, TripSeats, AuditLogs)]
    end

    subgraph AdminDashboard["Admin / Operator Dashboard"]
        M[Trip Manifest with Seat Numbers]
        CSV[Export CSV Manifest]
        Rev[Revenue & Booking Metrics]
        Occ[Route-wise Occupancy %]
        AuditView[Security Audit Log Viewer]
    end

    B --> DB
    C --> DB
    DB --> M
    DB --> CSV
    DB --> Rev
    DB --> Occ
    DB --> AuditView
```

---

## 3. Database Relational Model (ER Diagram)

```mermaid
erDiagram
    User ||--o{ Booking : "makes"
    User ||--o{ AuditLog : "triggers"
    Operator ||--o{ Bus : "owns/operates"
    Bus ||--o{ Seat : "has physical"
    Bus ||--o{ Trip : "assigned to"
    Route ||--o{ RouteStop : "contains"
    Route ||--o{ Trip : "scheduled on"
    Stop ||--o{ RouteStop : "locates"
    Trip ||--o{ TripSeat : "inventories"
    Trip ||--o{ Booking : "booked on"
    Seat ||--o{ TripSeat : "mapped to"
    Booking ||--o{ Passenger : "carries"
    Booking ||--o{ BookingSeat : "allocates"
    Booking ||--o| Cancellation : "has"
    TripSeat ||--o| BookingSeat : "linked to"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string phone
        enum role "ADMIN | OPERATOR | CUSTOMER"
        datetime createdAt
    }

    Operator {
        string id PK
        string name
        string contactDetails
        enum status "ACTIVE | INACTIVE"
    }

    Bus {
        string id PK
        string operatorId FK
        string registrationNumber UK
        string busName
        enum busType "LUXURY_VOLVO | AC_SLEEPER | AC_SEATER | NON_AC_SLEEPER | NON_AC_SEATER"
        int totalSeats
        string amenities
        enum status "ACTIVE | MAINTENANCE | INACTIVE"
    }

    Seat {
        string id PK
        string busId FK
        string seatNumber
        enum seatType "WINDOW | AISLE | UPPER_SLEEPER | LOWER_SLEEPER"
        int row
        int column
    }

    Route {
        string id PK
        string source
        string destination
        float distance
        int estimatedDuration
    }

    Stop {
        string id PK
        string name
        string city
        string address
    }

    RouteStop {
        string id PK
        string routeId FK
        string stopId FK
        int stopOrder
        int arrivalOffset
        int departureOffset
    }

    Trip {
        string id PK
        string busId FK
        string routeId FK
        datetime departureDateTime
        datetime arrivalDateTime
        float baseFare
        enum status "SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED"
    }

    TripSeat {
        string id PK
        string tripId FK
        string seatId FK
        enum status "AVAILABLE | LOCKED | BOOKED"
        datetime lockedUntil
        int version
    }

    Booking {
        string id PK
        string pnr UK
        string userId FK
        string tripId FK
        float totalAmount
        enum status "PENDING | CONFIRMED | CANCELLED | FAILED"
        datetime bookingDate
    }

    Passenger {
        string id PK
        string bookingId FK
        string fullName
        int age
        enum gender "MALE | FEMALE | OTHER"
        string phone
    }

    BookingSeat {
        string id PK
        string bookingId FK
        string tripSeatId FK
        float fare
    }

    Cancellation {
        string id PK
        string bookingId FK
        string cancellationReason
        float cancellationAmount
        float refundAmount
        enum refundStatus "PENDING | COMPLETED | FAILED"
        datetime cancelledAt
    }

    CancellationPolicy {
        string id PK
        int hoursBeforeDeparture
        float refundPercentage
        boolean isActive
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string entityType
        string entityId
        string metadata
        datetime createdAt
    }
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Capability / Resource | Public Guest | Customer | Fleet Operator | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Search Buses & Routes | ✅ | ✅ | ✅ | ✅ |
| View Bus Seat Layouts | ✅ | ✅ | ✅ | ✅ |
| Lock Seats & Checkout | ❌ | ✅ | ❌ | ✅ |
| View Personal Bookings | ❌ | ✅ | ❌ | ✅ |
| Cancel Eligible Bookings | ❌ | ✅ | ❌ | ✅ |
| View Passenger Manifests | ❌ | ❌ | ✅ (Assigned) | ✅ (All) |
| Export Manifest to CSV | ❌ | ❌ | ✅ | ✅ |
| Create / Edit Buses & Seats | ❌ | ❌ | ❌ | ✅ |
| Manage Routes & Stops | ❌ | ❌ | ❌ | ✅ |
| Schedule Trips | ❌ | ❌ | ❌ | ✅ |
| View Revenue & Analytics | ❌ | ❌ | ❌ | ✅ |
| View Audit Trail Logs | ❌ | ❌ | ❌ | ✅ |

---

## 5. Quick Start & Execution

1. **Install Dependencies**: `pnpm install`
2. **Apply DB Schema**: `pnpm prisma db push`
3. **Seed Database**: `pnpm prisma:seed`
4. **Run Vitest Suite**: `pnpm test` (22 unit, integration, and E2E tests)
5. **Start Dev Server**: `pnpm dev` (http://localhost:3000)

