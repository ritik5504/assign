import { PrismaClient, Role, BusType, BusStatus, OperatorStatus, SeatType, SeatStatus, TripStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing records in proper order
  await prisma.auditLog.deleteMany();
  await prisma.cancellation.deleteMany();
  await prisma.bookingSeat.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tripSeat.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cancellationPolicy.deleteMany();

  // 1. Password Hashes
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const operatorPasswordHash = await bcrypt.hash("Operator@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);

  // 2. Users
  const admin = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "admin@swifttransit.in",
      passwordHash: adminPasswordHash,
      phone: "+91-98765-00100",
      role: Role.ADMIN,
    },
  });

  const operatorUser1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "operator1@swifttransit.in",
      passwordHash: operatorPasswordHash,
      phone: "+91-98765-00101",
      role: Role.OPERATOR,
    },
  });

  const operatorUser2 = await prisma.user.create({
    data: {
      name: "Amit Patel",
      email: "operator2@swifttransit.in",
      passwordHash: operatorPasswordHash,
      phone: "+91-98765-00102",
      role: Role.OPERATOR,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "rahul@example.com",
      passwordHash: customerPasswordHash,
      phone: "+91-98765-00201",
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Priya Singh",
      email: "priya@example.com",
      passwordHash: customerPasswordHash,
      phone: "+91-98765-00202",
      role: Role.CUSTOMER,
    },
  });

  console.log("✅ Seeded Users: Admin, 2 Operators, 2 Customers");

  // 3. Operators
  const operator1 = await prisma.operator.create({
    data: {
      name: "Sharma Travels Pvt. Ltd.",
      contactDetails: "support@sharmatravels.in | 1800-123-7001",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator2 = await prisma.operator.create({
    data: {
      name: "Patel Express Motors",
      contactDetails: "info@patelexpress.in | 1800-123-7002",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator3 = await prisma.operator.create({
    data: {
      name: "VRL Travels",
      contactDetails: "concierge@vrltravels.in | 1800-123-7003",
      status: OperatorStatus.ACTIVE,
    },
  });

  console.log("✅ Seeded 3 Bus Operators");

  // 4. Cancellation Policies
  await prisma.cancellationPolicy.createMany({
    data: [
      { hoursBeforeDeparture: 24, refundPercentage: 90.0, isActive: true },
      { hoursBeforeDeparture: 12, refundPercentage: 75.0, isActive: true },
      { hoursBeforeDeparture: 6, refundPercentage: 50.0, isActive: true },
      { hoursBeforeDeparture: 0, refundPercentage: 0.0, isActive: true },
    ],
  });
  console.log("✅ Seeded Cancellation Policies");

  // 5. Buses (10+ buses with different configurations)
  const busConfigs = [
    {
      operatorId: operator1.id,
      registrationNumber: "MH-12-AB-1234",
      busName: "Sharma Falcon Volvo",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["High-Speed WiFi", "AC", "USB Charging", "Reclining Seats", "Mineral Water", "Live GPS"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "MH-12-AB-1235",
      busName: "Sharma Royal Sleeper",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["WiFi", "AC", "Personal Blanket", "Reading Light", "Charging Port", "Pillow"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "MH-04-CD-5678",
      busName: "Sharma Coastal Liner",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "Air Conditioning", "USB Charging", "Onboard Restroom"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "KA-05-XY-5678",
      busName: "Patel Star Sleeper",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["WiFi", "Panoramic Windows", "Leather Seats", "Complimentary Snacks", "Restroom"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "KA-05-XY-5679",
      busName: "Patel Pacific Express",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["Air Conditioning", "Sleeper Berths", "Privacy Curtains", "WiFi", "Emergency Kit"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "TN-01-PQ-9876",
      busName: "Patel Night Rider",
      busType: BusType.NON_AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["Comfort Seats", "Luggage Storage", "First Aid Box"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "AP-09-MN-3344",
      busName: "VRL Mysore King",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["Ultra WiFi", "Individual Screens", "AC", "Leather Recliners", "Snack Bar"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "DL-01-RS-7788",
      busName: "VRL Sunshine Dreamer",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["AC", "Luxury Linen", "Soft Lighting", "Reading Lamps", "Complimentary Water"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "WB-02-TU-4455",
      busName: "VRL Deccan Runner",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "AC", "Reclining Seats", "Overhead Storage"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "MH-14-EF-2211",
      busName: "Sharma Liberty Express",
      busType: BusType.NON_AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["Sleeper Berths", "Window Curtains", "Luggage Rack"]),
    },
  ];

  const createdBuses = [];
  for (const b of busConfigs) {
    const bus = await prisma.bus.create({
      data: {
        operatorId: b.operatorId,
        registrationNumber: b.registrationNumber,
        busName: b.busName,
        busType: b.busType,
        totalSeats: b.totalSeats,
        amenities: b.amenities,
        status: BusStatus.ACTIVE,
      },
    });
    createdBuses.push(bus);

    // Create seats according to layout
    const seatData = [];
    if (b.busType === BusType.AC_SLEEPER || b.busType === BusType.NON_AC_SLEEPER) {
      // Sleeper Layout: 30 berths (10 rows x 3 columns: Left 1, Right 2). Lower berths (L1-L15) and Upper berths (U1-U15)
      for (let r = 1; r <= 5; r++) {
        // Lower deck
        seatData.push({ busId: bus.id, seatNumber: `L${(r - 1) * 3 + 1}`, seatType: SeatType.WINDOW, row: r, column: 1 });
        seatData.push({ busId: bus.id, seatNumber: `L${(r - 1) * 3 + 2}`, seatType: SeatType.AISLE, row: r, column: 2 });
        seatData.push({ busId: bus.id, seatNumber: `L${(r - 1) * 3 + 3}`, seatType: SeatType.WINDOW, row: r, column: 3 });
        // Upper deck
        seatData.push({ busId: bus.id, seatNumber: `U${(r - 1) * 3 + 1}`, seatType: SeatType.UPPER_SLEEPER, row: r + 5, column: 1 });
        seatData.push({ busId: bus.id, seatNumber: `U${(r - 1) * 3 + 2}`, seatType: SeatType.UPPER_SLEEPER, row: r + 5, column: 2 });
        seatData.push({ busId: bus.id, seatNumber: `U${(r - 1) * 3 + 3}`, seatType: SeatType.UPPER_SLEEPER, row: r + 5, column: 3 });
      }
    } else {
      // Seater Layout: 2+2 layout across rows
      const rows = b.totalSeats / 4;
      for (let r = 1; r <= rows; r++) {
        seatData.push({ busId: bus.id, seatNumber: `${r}A`, seatType: SeatType.WINDOW, row: r, column: 1 });
        seatData.push({ busId: bus.id, seatNumber: `${r}B`, seatType: SeatType.AISLE, row: r, column: 2 });
        seatData.push({ busId: bus.id, seatNumber: `${r}C`, seatType: SeatType.AISLE, row: r, column: 3 });
        seatData.push({ busId: bus.id, seatNumber: `${r}D`, seatType: SeatType.WINDOW, row: r, column: 4 });
      }
    }

    await prisma.seat.createMany({ data: seatData });
  }

  console.log(`✅ Seeded ${createdBuses.length} Buses with complete seat mappings`);

  // 6. Routes and Stops (Indian cities)
  const stopsList = [
    { name: "CSMT Bus Terminal", city: "Mumbai", address: "Chhatrapati Shivaji Maharaj Terminus Area, Mumbai - 400001" },
    { name: "Shivajinagar Bus Stand", city: "Pune", address: "Shivajinagar, Pune - 411005, Maharashtra" },
    { name: "CBS Bus Stand", city: "Nashik", address: "Central Bus Stand, Nashik - 422001, Maharashtra" },
    { name: "Majestic Bus Terminal (KSRTC)", city: "Bangalore", address: "Gubbi Thotadappa Rd, Majestic, Bengaluru - 560009" },
    { name: "Central Bus Stand", city: "Mysore", address: "Mysore Central Bus Stand, Mysore - 570001, Karnataka" },
    { name: "Hubli Bus Stand", city: "Hubli", address: "NWKRTC Bus Stand, Hubli - 580020, Karnataka" },
    { name: "CMBT Koyambedu", city: "Chennai", address: "Jawaharlal Nehru Salai, Koyambedu, Chennai - 600107" },
    { name: "Central Bus Stand", city: "Coimbatore", address: "Dr. Nanjappa Rd, Coimbatore - 641018, Tamil Nadu" },
    { name: "Mattuthavani Bus Stand", city: "Madurai", address: "Madurai Bypass Rd, Madurai - 625107, Tamil Nadu" },
    { name: "Mahatma Gandhi Bus Station (MGBS)", city: "Hyderabad", address: "Imlibun, Hyderabad - 500001, Telangana" },
    { name: "Pandit Nehru Bus Station", city: "Vijayawada", address: "Pandit Nehru Bus Station, Vijayawada - 520001, Andhra Pradesh" },
    { name: "Kashmere Gate ISBT", city: "Delhi", address: "Inter State Bus Terminal, Kashmere Gate, Delhi - 110006" },
    { name: "Sindhi Camp Bus Stand", city: "Jaipur", address: "Station Rd, Sindhi Camp, Jaipur - 302006, Rajasthan" },
    { name: "Idgah Bus Stand", city: "Agra", address: "Idgah Colony, Agra - 282001, Uttar Pradesh" },
    { name: "Alambagh Bus Stand", city: "Lucknow", address: "Alambagh, Lucknow - 226005, Uttar Pradesh" },
    { name: "Esplanade Bus Terminal", city: "Kolkata", address: "Esplanade, Kolkata - 700001, West Bengal" },
    { name: "Baramunda Bus Terminal", city: "Bhubaneswar", address: "Baramunda, Bhubaneswar - 751003, Odisha" },
    { name: "Aurangabad Central Bus Stand", city: "Aurangabad", address: "Station Road, Aurangabad - 431001, Maharashtra" },
  ];

  const stopMap: Record<string, string> = {};
  for (const s of stopsList) {
    const stop = await prisma.stop.create({ data: s });
    stopMap[s.city] = stop.id;
  }

  const routeConfigs = [
    { source: "Mumbai", destination: "Pune", distance: 160.0, estimatedDuration: 180, stops: ["Mumbai", "Pune"] },
    { source: "Pune", destination: "Mumbai", distance: 160.0, estimatedDuration: 180, stops: ["Pune", "Mumbai"] },
    { source: "Bangalore", destination: "Mysore", distance: 145.0, estimatedDuration: 150, stops: ["Bangalore", "Mysore"] },
    { source: "Mysore", destination: "Bangalore", distance: 145.0, estimatedDuration: 150, stops: ["Mysore", "Bangalore"] },
    { source: "Chennai", destination: "Coimbatore", distance: 500.0, estimatedDuration: 420, stops: ["Chennai", "Coimbatore"] },
    { source: "Coimbatore", destination: "Chennai", distance: 500.0, estimatedDuration: 420, stops: ["Coimbatore", "Chennai"] },
    { source: "Hyderabad", destination: "Vijayawada", distance: 275.0, estimatedDuration: 240, stops: ["Hyderabad", "Vijayawada"] },
    { source: "Vijayawada", destination: "Hyderabad", distance: 275.0, estimatedDuration: 240, stops: ["Vijayawada", "Hyderabad"] },
    { source: "Delhi", destination: "Jaipur", distance: 280.0, estimatedDuration: 300, stops: ["Delhi", "Jaipur"] },
    { source: "Kolkata", destination: "Bhubaneswar", distance: 440.0, estimatedDuration: 360, stops: ["Kolkata", "Bhubaneswar"] },
    { source: "Mumbai", destination: "Nashik", distance: 170.0, estimatedDuration: 210, stops: ["Mumbai", "Nashik"] },
    { source: "Nashik", destination: "Pune", distance: 210.0, estimatedDuration: 270, stops: ["Nashik", "Pune"] },
    { source: "Pune", destination: "Aurangabad", distance: 235.0, estimatedDuration: 300, stops: ["Pune", "Aurangabad"] },
    { source: "Bangalore", destination: "Hubli", distance: 410.0, estimatedDuration: 390, stops: ["Bangalore", "Hubli"] },
    { source: "Chennai", destination: "Madurai", distance: 460.0, estimatedDuration: 450, stops: ["Chennai", "Madurai"] },
    { source: "Delhi", destination: "Agra", distance: 230.0, estimatedDuration: 240, stops: ["Delhi", "Agra"] },
    { source: "Delhi", destination: "Lucknow", distance: 530.0, estimatedDuration: 480, stops: ["Delhi", "Agra", "Lucknow"] },
    { source: "Agra", destination: "Jaipur", distance: 240.0, estimatedDuration: 270, stops: ["Agra", "Jaipur"] },
  ];

  const createdRoutes = [];
  for (const rc of routeConfigs) {
    const route = await prisma.route.create({
      data: {
        source: rc.source,
        destination: rc.destination,
        distance: rc.distance,
        estimatedDuration: rc.estimatedDuration,
      },
    });
    createdRoutes.push(route);

    for (let idx = 0; idx < rc.stops.length; idx++) {
      const city = rc.stops[idx];
      const stopId = stopMap[city];
      const isFirst = idx === 0;
      const isLast = idx === rc.stops.length - 1;
      const fraction = idx / (rc.stops.length - 1 || 1);
      const arrOffset = Math.round(rc.estimatedDuration * fraction);
      const depOffset = isLast ? arrOffset : arrOffset + (isFirst ? 0 : 15);

      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          stopId: stopId,
          stopOrder: idx + 1,
          arrivalOffset: arrOffset,
          departureOffset: depOffset,
        },
      });
    }
  }

  console.log(`✅ Seeded ${createdRoutes.length} Routes with intermediate stops`);

  // 7. Scheduled Trips (At least 20 trips across today, tomorrow, and future days)
  // Fares in INR
  const baseTime = new Date();
  baseTime.setMinutes(0, 0, 0);

  const tripConfigs = [
    // Today trips (morning, afternoon, night)
    { routeIndex: 0, busIndex: 0, hoursOffset: 2, fare: 850.0 },
    { routeIndex: 0, busIndex: 1, hoursOffset: 8, fare: 650.0 },
    { routeIndex: 1, busIndex: 2, hoursOffset: 4, fare: 450.0 },
    { routeIndex: 2, busIndex: 3, hoursOffset: 3, fare: 950.0 },
    { routeIndex: 2, busIndex: 4, hoursOffset: 12, fare: 700.0 },
    { routeIndex: 3, busIndex: 3, hoursOffset: 6, fare: 950.0 },
    { routeIndex: 4, busIndex: 5, hoursOffset: 2, fare: 500.0 },
    { routeIndex: 5, busIndex: 5, hoursOffset: 7, fare: 500.0 },
    { routeIndex: 6, busIndex: 8, hoursOffset: 5, fare: 600.0 },
    { routeIndex: 7, busIndex: 9, hoursOffset: 3, fare: 400.0 },

    // Tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 24, fare: 900.0 },
    { routeIndex: 0, busIndex: 1, hoursOffset: 32, fare: 700.0 },
    { routeIndex: 1, busIndex: 2, hoursOffset: 28, fare: 480.0 },
    { routeIndex: 2, busIndex: 4, hoursOffset: 26, fare: 750.0 },
    { routeIndex: 3, busIndex: 3, hoursOffset: 30, fare: 1000.0 },
    { routeIndex: 4, busIndex: 5, hoursOffset: 25, fare: 520.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 27, fare: 1100.0 },
    { routeIndex: 9, busIndex: 7, hoursOffset: 29, fare: 800.0 },

    // Day after tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 48, fare: 920.0 },
    { routeIndex: 1, busIndex: 1, hoursOffset: 52, fare: 720.0 },
    { routeIndex: 2, busIndex: 3, hoursOffset: 50, fare: 980.0 },
    { routeIndex: 6, busIndex: 8, hoursOffset: 54, fare: 620.0 },
    { routeIndex: 7, busIndex: 9, hoursOffset: 49, fare: 420.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 51, fare: 1150.0 },

    // Additional popular city-pair connections across India
    { routeIndex: 10, busIndex: 2, hoursOffset: 4, fare: 450.0 },  // Mumbai -> Nashik
    { routeIndex: 11, busIndex: 0, hoursOffset: 6, fare: 550.0 },  // Nashik -> Pune
    { routeIndex: 12, busIndex: 1, hoursOffset: 8, fare: 600.0 },  // Pune -> Aurangabad
    { routeIndex: 13, busIndex: 4, hoursOffset: 5, fare: 850.0 },  // Bangalore -> Hubli
    { routeIndex: 14, busIndex: 5, hoursOffset: 7, fare: 900.0 },  // Chennai -> Madurai
    { routeIndex: 15, busIndex: 7, hoursOffset: 3, fare: 500.0 },  // Delhi -> Agra
    { routeIndex: 16, busIndex: 6, hoursOffset: 10, fare: 1200.0 }, // Delhi -> Lucknow
    { routeIndex: 17, busIndex: 8, hoursOffset: 4, fare: 550.0 },  // Agra -> Jaipur

    // Next day connections
    { routeIndex: 10, busIndex: 2, hoursOffset: 28, fare: 450.0 },
    { routeIndex: 11, busIndex: 0, hoursOffset: 30, fare: 550.0 },
    { routeIndex: 12, busIndex: 1, hoursOffset: 32, fare: 600.0 },
    { routeIndex: 13, busIndex: 4, hoursOffset: 29, fare: 850.0 },
    { routeIndex: 14, busIndex: 5, hoursOffset: 31, fare: 900.0 },
    { routeIndex: 15, busIndex: 7, hoursOffset: 27, fare: 500.0 },
    { routeIndex: 16, busIndex: 6, hoursOffset: 34, fare: 1200.0 },
    { routeIndex: 17, busIndex: 8, hoursOffset: 28, fare: 550.0 },
  ];

  const createdTrips = [];
  for (const tc of tripConfigs) {
    const route = createdRoutes[tc.routeIndex];
    const bus = createdBuses[tc.busIndex];

    const departure = new Date(baseTime.getTime() + tc.hoursOffset * 3600 * 1000);
    const arrival = new Date(departure.getTime() + route.estimatedDuration * 60 * 1000);

    const trip = await prisma.trip.create({
      data: {
        busId: bus.id,
        routeId: route.id,
        departureDateTime: departure,
        arrivalDateTime: arrival,
        baseFare: tc.fare,
        status: TripStatus.SCHEDULED,
      },
    });
    createdTrips.push(trip);

    // Populate TripSeats for every seat in the bus
    const busSeats = await prisma.seat.findMany({ where: { busId: bus.id } });
    const tripSeatData = busSeats.map((seat) => ({
      tripId: trip.id,
      seatId: seat.id,
      status: SeatStatus.AVAILABLE,
      version: 0,
    }));

    await prisma.tripSeat.createMany({ data: tripSeatData });
  }

  console.log(`✅ Seeded ${createdTrips.length} Trips with full TripSeat availability inventory`);

  // 8. Sample Confirmed Bookings for demonstration
  // Let's create an existing confirmed booking for customer1 on Trip 0
  const tripToBook = createdTrips[0];
  const tripSeatsToBook = await prisma.tripSeat.findMany({
    where: { tripId: tripToBook.id },
    take: 2,
    include: { seat: true },
  });

  if (tripSeatsToBook.length >= 2) {
    const booking = await prisma.booking.create({
      data: {
        pnr: "PNR-MUM-849201",
        userId: customer1.id,
        tripId: tripToBook.id,
        totalAmount: tripToBook.baseFare * 2,
        status: BookingStatus.CONFIRMED,
        bookingDate: new Date(),
        passengers: {
          create: [
            { fullName: "Rahul Verma", age: 32, gender: "MALE", phone: "+91-98765-00201" },
            { fullName: "Priya Verma", age: 29, gender: "FEMALE", phone: "+91-98765-00203" },
          ],
        },
        bookingSeats: {
          create: [
            { tripSeatId: tripSeatsToBook[0].id, fare: tripToBook.baseFare },
            { tripSeatId: tripSeatsToBook[1].id, fare: tripToBook.baseFare },
          ],
        },
      },
    });

    // Mark those trip seats as BOOKED
    await prisma.tripSeat.updateMany({
      where: { id: { in: tripSeatsToBook.map((ts) => ts.id) } },
      data: { status: SeatStatus.BOOKED },
    });

    await prisma.auditLog.create({
      data: {
        userId: customer1.id,
        action: "BOOKING_CREATED",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: JSON.stringify({ pnr: booking.pnr, seats: tripSeatsToBook.map((ts) => ts.seat.seatNumber) }),
      },
    });

    console.log(`✅ Seeded sample booking with PNR: ${booking.pnr}`);
  }

  console.log("🚀 Database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
