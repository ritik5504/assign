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
      name: "Super Admin",
      email: "admin@busbooking.com",
      passwordHash: adminPasswordHash,
      phone: "+1-555-0100",
      role: Role.ADMIN,
    },
  });

  const operatorUser1 = await prisma.user.create({
    data: {
      name: "Apex Express Dispatcher",
      email: "operator1@busbooking.com",
      passwordHash: operatorPasswordHash,
      phone: "+1-555-0101",
      role: Role.OPERATOR,
    },
  });

  const operatorUser2 = await prisma.user.create({
    data: {
      name: "BlueSky Lines Dispatcher",
      email: "operator2@busbooking.com",
      passwordHash: operatorPasswordHash,
      phone: "+1-555-0102",
      role: Role.OPERATOR,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      passwordHash: customerPasswordHash,
      phone: "+1-555-0201",
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      passwordHash: customerPasswordHash,
      phone: "+1-555-0202",
      role: Role.CUSTOMER,
    },
  });

  console.log("✅ Seeded Users: Admin, 2 Operators, 2 Customers");

  // 3. Operators
  const operator1 = await prisma.operator.create({
    data: {
      name: "Apex Express Mobility",
      contactDetails: "support@apexexpress.com | 1-800-555-APEX",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator2 = await prisma.operator.create({
    data: {
      name: "BlueSky Intercity Lines",
      contactDetails: "info@blueskylines.com | 1-800-555-BLUE",
      status: OperatorStatus.ACTIVE,
    },
  });

  const operator3 = await prisma.operator.create({
    data: {
      name: "Voyager Premium Coaches",
      contactDetails: "concierge@voyagercoaches.com | 1-800-555-VOY",
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
      registrationNumber: "US-NY-7821",
      busName: "Apex Falcon Express",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["High-Speed WiFi", "AC", "Power Outlets", "Reclining Seats", "Snacks & Water", "Live GPS"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "US-NY-7822",
      busName: "Apex Royal Sleeper",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["WiFi", "AC", "Personal Blanket", "Reading Light", "Charging Port", "Pillow"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "US-MA-4410",
      busName: "Apex Coastal Cruiser",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "Air Conditioning", "USB Charging", "Onboard Restroom"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "US-CA-9901",
      busName: "BlueSky Pacific Glider",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["WiFi", "Panoramic Windows", "Leather Seats", "Complimentary Beverages", "Restroom"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "US-CA-9902",
      busName: "BlueSky Star Sleeper",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["Air Conditioning", "Sleeper Berths", "Privacy Curtains", "WiFi", "Emergency Kit"]),
    },
    {
      operatorId: operator2.id,
      registrationNumber: "US-WA-1234",
      busName: "BlueSky Sound Runner",
      busType: BusType.NON_AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["Comfort Seats", "Luggage Storage", "First Aid Box"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "US-TX-5511",
      busName: "Voyager Lone Star",
      busType: BusType.LUXURY_VOLVO,
      totalSeats: 36,
      amenities: JSON.stringify(["Ultra WiFi", "Individual Screens", "AC", "Leather Recliners", "Snack Bar"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "US-FL-3301",
      busName: "Voyager Sunshine Dreamer",
      busType: BusType.AC_SLEEPER,
      totalSeats: 30,
      amenities: JSON.stringify(["AC", "Luxury Linen", "Soft Lighting", "Reading Lamps", "Complimentary Water"]),
    },
    {
      operatorId: operator3.id,
      registrationNumber: "US-IL-8820",
      busName: "Voyager Midwest Shuttle",
      busType: BusType.AC_SEATER,
      totalSeats: 40,
      amenities: JSON.stringify(["WiFi", "AC", "Reclining Seats", "Overhead Storage"]),
    },
    {
      operatorId: operator1.id,
      registrationNumber: "US-PA-6677",
      busName: "Apex Liberty Connect",
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

  // 6. Routes and Stops
  const stopsList = [
    { name: "Port Authority Bus Terminal", city: "New York", address: "625 8th Ave, New York, NY 10018" },
    { name: "Newark Penn Station", city: "Newark", address: "1 Raymond Plaza W, Newark, NJ 07102" },
    { name: "South Station Terminal", city: "Boston", address: "700 Atlantic Ave, Boston, MA 02110" },
    { name: "Hartford Union Station", city: "Hartford", address: "One Union Place, Hartford, CT 06103" },
    { name: "Los Angeles Union Station", city: "Los Angeles", address: "800 N Alameda St, Los Angeles, CA 90012" },
    { name: "Bakersfield Transit Center", city: "Bakersfield", address: "Fresno Ave & 8th St, Bakersfield, CA 93301" },
    { name: "San Francisco Salesforce Transit", city: "San Francisco", address: "425 Mission St, San Francisco, CA 94105" },
    { name: "Seattle King Street Station", city: "Seattle", address: "303 S Jackson St, Seattle, WA 98104" },
    { name: "Tacoma Dome Station", city: "Tacoma", address: "505 E 25th St, Tacoma, WA 98421" },
    { name: "Portland Union Station", city: "Portland", address: "800 NW 6th Ave, Portland, OR 97209" },
    { name: "Chicago Union Station", city: "Chicago", address: "225 S Canal St, Chicago, IL 60606" },
    { name: "Detroit Rosa Parks Transit", city: "Detroit", address: "360 Michigan Ave, Detroit, MI 48226" },
    { name: "Washington Union Station", city: "Washington DC", address: "50 Massachusetts Ave NE, Washington, DC 20002" },
    { name: "Philadelphia 30th Street", city: "Philadelphia", address: "2955 Market St, Philadelphia, PA 19104" },
    { name: "Dallas Downtown Station", city: "Dallas", address: "2010 Levee St, Dallas, TX 75207" },
    { name: "Houston Magnolia Transit", city: "Houston", address: "2121 San Jacinto St, Houston, TX 77002" },
    { name: "Miami Central Station", city: "Miami", address: "3801 NW 21st St, Miami, FL 33142" },
    { name: "Orlando LYNX Central", city: "Orlando", address: "455 N Garland Ave, Orlando, FL 32801" },
  ];

  const stopMap: Record<string, string> = {};
  for (const s of stopsList) {
    const stop = await prisma.stop.create({ data: s });
    stopMap[s.city] = stop.id;
  }

  const routeConfigs = [
    { source: "New York", destination: "Boston", distance: 350.0, estimatedDuration: 270, stops: ["New York", "Hartford", "Boston"] },
    { source: "Boston", destination: "New York", distance: 350.0, estimatedDuration: 270, stops: ["Boston", "Hartford", "New York"] },
    { source: "Los Angeles", destination: "San Francisco", distance: 615.0, estimatedDuration: 420, stops: ["Los Angeles", "Bakersfield", "San Francisco"] },
    { source: "San Francisco", destination: "Los Angeles", distance: 615.0, estimatedDuration: 420, stops: ["San Francisco", "Bakersfield", "Los Angeles"] },
    { source: "Seattle", destination: "Portland", distance: 280.0, estimatedDuration: 210, stops: ["Seattle", "Tacoma", "Portland"] },
    { source: "Portland", destination: "Seattle", distance: 280.0, estimatedDuration: 210, stops: ["Portland", "Tacoma", "Seattle"] },
    { source: "Chicago", destination: "Detroit", distance: 450.0, estimatedDuration: 330, stops: ["Chicago", "Detroit"] },
    { source: "Washington DC", destination: "Philadelphia", distance: 225.0, estimatedDuration: 160, stops: ["Washington DC", "Philadelphia"] },
    { source: "Dallas", destination: "Houston", distance: 385.0, estimatedDuration: 240, stops: ["Dallas", "Houston"] },
    { source: "Miami", destination: "Orlando", distance: 380.0, estimatedDuration: 230, stops: ["Miami", "Orlando"] },
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
  const baseTime = new Date();
  baseTime.setMinutes(0, 0, 0);

  const tripConfigs = [
    // Today trips (morning, afternoon, night)
    { routeIndex: 0, busIndex: 0, hoursOffset: 2, fare: 48.0 },
    { routeIndex: 0, busIndex: 1, hoursOffset: 8, fare: 65.0 },
    { routeIndex: 1, busIndex: 2, hoursOffset: 4, fare: 42.0 },
    { routeIndex: 2, busIndex: 3, hoursOffset: 3, fare: 75.0 },
    { routeIndex: 2, busIndex: 4, hoursOffset: 12, fare: 85.0 },
    { routeIndex: 3, busIndex: 3, hoursOffset: 6, fare: 75.0 },
    { routeIndex: 4, busIndex: 5, hoursOffset: 2, fare: 35.0 },
    { routeIndex: 5, busIndex: 5, hoursOffset: 7, fare: 35.0 },
    { routeIndex: 6, busIndex: 8, hoursOffset: 5, fare: 52.0 },
    { routeIndex: 7, busIndex: 9, hoursOffset: 3, fare: 32.0 },

    // Tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 24, fare: 50.0 },
    { routeIndex: 0, busIndex: 1, hoursOffset: 32, fare: 68.0 },
    { routeIndex: 1, busIndex: 2, hoursOffset: 28, fare: 45.0 },
    { routeIndex: 2, busIndex: 4, hoursOffset: 26, fare: 88.0 },
    { routeIndex: 3, busIndex: 3, hoursOffset: 30, fare: 78.0 },
    { routeIndex: 4, busIndex: 5, hoursOffset: 25, fare: 36.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 27, fare: 48.0 },
    { routeIndex: 9, busIndex: 7, hoursOffset: 29, fare: 55.0 },

    // Day after tomorrow trips
    { routeIndex: 0, busIndex: 0, hoursOffset: 48, fare: 52.0 },
    { routeIndex: 1, busIndex: 1, hoursOffset: 52, fare: 70.0 },
    { routeIndex: 2, busIndex: 3, hoursOffset: 50, fare: 80.0 },
    { routeIndex: 6, busIndex: 8, hoursOffset: 54, fare: 55.0 },
    { routeIndex: 7, busIndex: 9, hoursOffset: 49, fare: 34.0 },
    { routeIndex: 8, busIndex: 6, hoursOffset: 51, fare: 50.0 },
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
        pnr: "PNR-NYB-849201",
        userId: customer1.id,
        tripId: tripToBook.id,
        totalAmount: tripToBook.baseFare * 2,
        status: BookingStatus.CONFIRMED,
        bookingDate: new Date(),
        passengers: {
          create: [
            { fullName: "John Doe", age: 32, gender: "MALE", phone: "+1-555-0201" },
            { fullName: "Sarah Doe", age: 29, gender: "FEMALE", phone: "+1-555-0203" },
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
