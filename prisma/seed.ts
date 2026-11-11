import { PrismaClient, Role, BusType, BusStatus, OperatorStatus, SeatType, SeatStatus, TripStatus, BookingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Indian Transit database seeding...");

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

  // 2. Indian Users
  const admin = await prisma.user.create({
    data: {
      name: "Rohan Sharma",
      email: "admin@busbooking.com",
      passwordHash: adminPasswordHash,
      phone: "+91 98111 22334",
      role: Role.ADMIN,
    },
  });

  const operatorUser1 = await prisma.user.create({
    data: {
      name: "Vikram Malhotra",
      email: "operator1@busbooking.com",
      passwordHash: operatorPasswordHash,
      phone: "+91 98222 33445",
      role: Role.OPERATOR,
    },
  });

  const operatorUser2 = await prisma.user.create({
    data: {
      name: "Pooja Verma",
      email: "operator2@busbooking.com",
      passwordHash: operatorPasswordHash,
      phone: "+91 98333 44556",
      role: Role.OPERATOR,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Aarav Patel",
      email: "aarav@example.com",
      passwordHash: customerPasswordHash,
      phone: "+91 98765 43210",
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Ananya Iyer",
      email: "ananya@example.com",
      passwordHash: customerPasswordHash,
      phone: "+91 98765 43211",
      role: Role.CUSTOMER,
    },
  });

  console.log("✅ Seeded Indian Users: Rohan Sharma (Admin), Vikram & Pooja (Operators), Aarav & Ananya (Customers)");

  // 3. Indian Bus Operators
  const operator1 = await prisma.operator.create({
    data: {
      name: "IntrCity SmartBus Mobility",
      contactDetails: "care@intrcity.com | 1800-102-8632",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator2 = await prisma.operator.create({
    data: {
      name: "Zingbus Intercity Express",
      contactDetails: "support@zingbus.com | 1800-120-0082",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator3 = await prisma.operator.create({
    data: {
      name: "VRL Travels & Logistics",
      contactDetails: "helpdesk@vrltravels.com | 080-26992666",
      status: OperatorStatus.ACTIVE,
    },
  });

  console.log("✅ Seeded 3 Leading Indian Bus Operators");

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

  // 5. Buses (10+ Indian buses with realistic state registrations)
  const busConfigs = [
    {
      operatorId: operator1.id,
      registrationNumber: "DL-01-AB-1234",
      busName: "IntrCity Garuda Volvo 9600",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["High-Speed WiFi", "AC", "USB Power Socket", "Reclining Pushback Seats", "Mineral Water", "Live GPS Tracking"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "DL-01-AB-1235",
      busName: "IntrCity Smart Sleeper BharatBenz",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["WiFi", "Air Conditioned", "Sanitized Blanket & Pillow", "Reading Lamp", "Charging Socket", "Curtains"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "KA-01-MJ-9901",
      busName: "IntrCity Airavat Club Class",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "AC", "USB Charging", "Overhead Luggage", "CCTV Surveillance"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "MH-12-PQ-5678",
      busName: "Zingbus Royal Multi-Axle Volvo",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["Free WiFi", "Panoramic Windows", "Leather Recliners", "Snacks & Water Bottle", "Emergency Hammer"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "MH-14-BT-5566",
      busName: "Zingbus Electric Intercity Cruiser",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["Zero-Emission EV", "AC", "Spacious Berths", "Privacy Screens", "Individual Charging", "Water Bottle"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "UP-16-BT-7788",
      busName: "Zingbus Highway Star",
      busType: BusType.NON_AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["Comfort Pushback Seats", "Luggage Storage", "First Aid Kit"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "KA-05-FA-4321",
      busName: "VRL I-Shift Super Luxury Scania",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["Satellite WiFi", "Personal Entertainment", "AC", "Calf Rest", "Mineral Water"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "KA-51-EX-6622",
      busName: "VRL Southern Dream Sleeper",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["AC", "Fresh Bedroll", "Soft Night Lamp", "Shoe Bag", "Mineral Water"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "GJ-01-XY-3344",
      busName: "VRL Western Deluxe Express",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "AC", "Pushback Ergonomic Seats", "Clean Interiors"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "RJ-14-PC-2345",
      busName: "IntrCity Marwar Classic",
      busType: BusType.NON_AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["Spacious Sleeper Berths", "Window Curtains", "Overhead Rack"]),
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
      // Sleeper Layout: 30 berths (Lower L1-L15, Upper U1-U15)
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

  console.log(`✅ Seeded ${createdBuses.length} Indian Buses with full berth and seat mappings`);

  // 6. Indian Stops and Terminals
  const stopsList = [
    { name: "Kashmere Gate ISBT", city: "Delhi", address: "Inter State Bus Terminal, Kashmere Gate, New Delhi - 110006" },
    { name: "IFFCO Chowk Terminal", city: "Gurugram", address: "IFFCO Chowk, NH 48, Gurugram, Haryana - 122001" },
    { name: "Sindhi Camp Bus Terminal", city: "Jaipur", address: "Station Road, Sindhi Camp, Jaipur, Rajasthan - 302001" },
    { name: "Majestic Kempegowda Bus Station", city: "Bengaluru", address: "Gubbi Thotadappa Rd, Majestic, Bengaluru, Karnataka - 560009" },
    { name: "Electronic City Toll Gate", city: "Bengaluru", address: "Hosur Road, Electronic City, Bengaluru - 560100" },
    { name: "Koyambedu CMBT", city: "Chennai", address: "Chennai Mofussil Bus Terminus, Koyambedu, Chennai, Tamil Nadu - 600107" },
    { name: "Sriperumbudur Toll Bypass", city: "Chennai", address: "Chennai-Bengaluru Highway, Sriperumbudur - 602105" },
    { name: "Borivali West Gokul Hotel", city: "Mumbai", address: "Western Express Highway, Borivali, Mumbai, Maharashtra - 400066" },
    { name: "Vashi Plaza Toll", city: "Navi Mumbai", address: "Sion-Panvel Expressway, Vashi, Navi Mumbai - 400703" },
    { name: "Swargate Bus Stand", city: "Pune", address: "Swargate, Pune, Maharashtra - 411042" },
    { name: "Wakad Hinjewadi Bridge", city: "Pune", address: "Mumbai-Pune Bypass, Wakad, Pune - 411057" },
    { name: "MGBS Central Bus Station", city: "Hyderabad", address: "Imlibun, Gowliguda, Hyderabad, Telangana - 500012" },
    { name: "Gachibowli Outer Ring Road", city: "Hyderabad", address: "Gachibowli Junction, Hyderabad - 500032" },
    { name: "Pandit Nehru Bus Station", city: "Vijayawada", address: "Autonagar, Vijayawada, Andhra Pradesh - 520013" },
    { name: "Panaji Kadamba Bus Terminal", city: "Goa", address: "KTC Bus Stand, Panaji, Goa - 403001" },
    { name: "Geeta Mandir Central Bus Terminus", city: "Ahmedabad", address: "Geeta Mandir Road, Ahmedabad, Gujarat - 380022" },
    { name: "Surat Central Station", city: "Surat", address: "Near Railway Station, Surat, Gujarat - 395003" },
    { name: "Private Luxury Bus Stand", city: "Manali", address: "The Mall Road, Manali, Himachal Pradesh - 175131" },
  ];

  const stopMap: Record<string, string> = {};
  for (const s of stopsList) {
    const stop = await prisma.stop.create({ data: s });
    stopMap[s.city] = stop.id;
  }

  // 7. Indian Routes with Distance (km) and Durations (minutes)
  const routeConfigs = [
    { source: "Delhi", destination: "Jaipur", distance: 280.0, estimatedDuration: 300, stops: ["Delhi", "Gurugram", "Jaipur"] },
    { source: "Jaipur", destination: "Delhi", distance: 280.0, estimatedDuration: 300, stops: ["Jaipur", "Gurugram", "Delhi"] },
    { source: "Bengaluru", destination: "Chennai", distance: 350.0, estimatedDuration: 360, stops: ["Bengaluru", "Chennai"] },
    { source: "Chennai", destination: "Bengaluru", distance: 350.0, estimatedDuration: 360, stops: ["Chennai", "Bengaluru"] },
    { source: "Mumbai", destination: "Pune", distance: 155.0, estimatedDuration: 180, stops: ["Mumbai", "Navi Mumbai", "Pune"] },
    { source: "Pune", destination: "Mumbai", distance: 155.0, estimatedDuration: 180, stops: ["Pune", "Navi Mumbai", "Mumbai"] },
    { source: "Hyderabad", destination: "Vijayawada", distance: 275.0, estimatedDuration: 300, stops: ["Hyderabad", "Vijayawada"] },
    { source: "Mumbai", destination: "Goa", distance: 580.0, estimatedDuration: 660, stops: ["Mumbai", "Pune", "Goa"] },
    { source: "Ahmedabad", destination: "Surat", distance: 260.0, estimatedDuration: 270, stops: ["Ahmedabad", "Surat"] },
    { source: "Delhi", destination: "Manali", distance: 540.0, estimatedDuration: 720, stops: ["Delhi", "Manali"] },
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
      const depOffset = isLast ? arrOffset : arrOffset + (isFirst ? 0 : 20);

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

  console.log(`✅ Seeded ${createdRoutes.length} Indian Highway Routes with intermediate station stops`);

  // 8. Scheduled Trips with Indian Rupee (INR - ₹) Fares
  const baseTime = new Date();
  baseTime.setMinutes(0, 0, 0);

  const tripConfigs = [
    // Today trips (morning, afternoon, overnight sleeper)
    { routeIndex: 0, busIndex: 0, hoursOffset: 2, fare: 650.0 },   // Delhi -> Jaipur Volvo
    { routeIndex: 0, busIndex: 1, hoursOffset: 8, fare: 850.0 },   // Delhi -> Jaipur Sleeper
    { routeIndex: 1, busIndex: 2, hoursOffset: 4, fare: 600.0 },   // Jaipur -> Delhi Seater
    { routeIndex: 2, busIndex: 3, hoursOffset: 3, fare: 950.0 },   // Blr -> Chn Volvo
    { routeIndex: 2, busIndex: 4, hoursOffset: 12, fare: 1200.0 }, // Blr -> Chn Sleeper
    { routeIndex: 3, busIndex: 3, hoursOffset: 6, fare: 950.0 },   // Chn -> Blr Volvo
    { routeIndex: 4, busIndex: 5, hoursOffset: 2, fare: 450.0 },   // Mum -> Pune Seater
    { routeIndex: 5, busIndex: 5, hoursOffset: 7, fare: 450.0 },   // Pune -> Mum Seater
    { routeIndex: 6, busIndex: 8, hoursOffset: 5, fare: 750.0 },   // Hyd -> Vij Seater
    { routeIndex: 7, busIndex: 9, hoursOffset: 10, fare: 1450.0 }, // Mum -> Goa Sleeper

    // Tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 24, fare: 700.0 },
    { routeIndex: 0, busIndex: 1, hoursOffset: 32, fare: 900.0 },
    { routeIndex: 1, busIndex: 2, hoursOffset: 28, fare: 650.0 },
    { routeIndex: 2, busIndex: 4, hoursOffset: 26, fare: 1250.0 },
    { routeIndex: 3, busIndex: 3, hoursOffset: 30, fare: 1000.0 },
    { routeIndex: 4, busIndex: 5, hoursOffset: 25, fare: 480.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 27, fare: 600.0 },  // Ahd -> Surat
    { routeIndex: 9, busIndex: 7, hoursOffset: 29, fare: 1650.0 }, // Delhi -> Manali Sleeper

    // Day after tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 48, fare: 720.0 },
    { routeIndex: 1, busIndex: 1, hoursOffset: 52, fare: 920.0 },
    { routeIndex: 2, busIndex: 3, hoursOffset: 50, fare: 1050.0 },
    { routeIndex: 6, busIndex: 8, hoursOffset: 54, fare: 800.0 },
    { routeIndex: 7, busIndex: 9, hoursOffset: 49, fare: 1550.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 51, fare: 620.0 },
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

  console.log(`✅ Seeded ${createdTrips.length} Indian Intercity Trips with base fares in ₹ INR`);

  // 9. Sample Confirmed Booking for demonstration
  const tripToBook = createdTrips[0];
  const tripSeatsToBook = await prisma.tripSeat.findMany({
    where: { tripId: tripToBook.id },
    take: 2,
    include: { seat: true },
  });

  if (tripSeatsToBook.length >= 2) {
    const booking = await prisma.booking.create({
      data: {
        pnr: "PNR-DEL-984210",
        userId: customer1.id,
        tripId: tripToBook.id,
        totalAmount: tripToBook.baseFare * 2,
        status: BookingStatus.CONFIRMED,
        bookingDate: new Date(),
        passengers: {
          create: [
            { fullName: "Aarav Patel", age: 31, gender: "MALE", phone: "+91 98765 43210" },
            { fullName: "Neha Patel", age: 28, gender: "FEMALE", phone: "+91 98765 43212" },
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

    console.log(`✅ Seeded sample booking with Indian PNR: ${booking.pnr} (Total: ₹${booking.totalAmount})`);
  }

  console.log("🚀 Indian Transit database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
