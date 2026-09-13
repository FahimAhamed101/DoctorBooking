const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config(); // fallback to current working directory

const {
  User,
  Team,
  Schedule,
  Subscription,
  Appointment,
  Document,
  Blog,
  Comment,
  Transaction,
  Values,
  Contact,
  FAQ,
  Notification,
  TermsAndCondition,
  AboutUs,
  PrivacyPolicy,
  ChildSafetyPolicy,
  Support,
} = require("../models");

const { ConversationModel, MessageModel } = require("../models/conversation.model");

// Pre-hashed password for "Password123!" using bcrypt salt 8
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("Password123!", 8);

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URL || "mongodb://localhost:27017/shadatvai";
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/\/\/.*@/, "//***:***@")}`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    console.error("Please verify that MongoDB is running or configure MONGODB_URL in your .env file.");
    process.exit(1);
  }
};

const cleanDatabase = async () => {
  console.log("Cleaning existing database collections...");
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Schedule.deleteMany({}),
    Subscription.deleteMany({}),
    Appointment.deleteMany({}),
    Document.deleteMany({}),
    Blog.deleteMany({}),
    Comment.deleteMany({}),
    ConversationModel.deleteMany({}),
    MessageModel.deleteMany({}),
    Transaction.deleteMany({}),
    Values.deleteMany({}),
    Contact.deleteMany({}),
    FAQ.deleteMany({}),
    Notification.deleteMany({}),
    TermsAndCondition.deleteMany({}),
    AboutUs.deleteMany({}),
    PrivacyPolicy.deleteMany({}),
    ChildSafetyPolicy.deleteMany({}),
    Support.deleteMany({}),
  ]);
  console.log("All relevant collections cleared successfully.");
};

const seedData = async () => {
  console.log("Starting data seeding...");

  // 1. Seed Users (Super Admin & Patients)
  console.log("Seeding Users...");
  const users = await User.create([
    {
      _id: new mongoose.Types.ObjectId("65f1a1000000000000000001"),
      userName: "super-admin",
      firstName: "Evans",
      lastName: "Michael",
      fullName: "Dr. Evans Michael",
      gender: "male",
      height: { value: 180, unit: "cm" },
      weight: { value: 78, unit: "kg" },
      dateOfBirth: new Date("1982-05-14"),
      email: "evansceo246@gmail.com",
      profileImage: "/uploads/users/doctor-1.png",
      password: DEFAULT_PASSWORD_HASH,
      callingCode: "+1",
      phoneNumber: 1735566789,
      address: "123 Medical Center Blvd, Suite 400, New York, NY 10001",
      medicalCondition: ["None"],
      role: "superAdmin",
      isEmailVerified: true,
      isProfileCompleted: true,
      chartCredits: 100,
      appointmentCredits: 50,
      subscription: {
        status: "active",
        isSubscriptionTaken: true,
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1a1000000000000000002"),
      userName: "user",
      firstName: "Sarah",
      lastName: "Johnson",
      fullName: "Sarah Johnson",
      gender: "female",
      height: { value: 165, unit: "cm" },
      weight: { value: 60, unit: "kg" },
      dateOfBirth: new Date("1994-08-22"),
      email: "user@gmail.com",
      profileImage: "/uploads/users/patient-1.png",
      password: DEFAULT_PASSWORD_HASH,
      callingCode: "+1",
      phoneNumber: 1734456873,
      address: "456 Elm Street, Apt 3B, New York, NY 10002",
      medicalCondition: ["Mild Asthma", "Seasonal Allergies"],
      role: "user",
      isEmailVerified: true,
      isProfileCompleted: true,
      chartCredits: 15,
      appointmentCredits: 3,
      subscription: {
        status: "active",
        isSubscriptionTaken: true,
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1a1000000000000000003"),
      userName: "david_miller",
      firstName: "David",
      lastName: "Miller",
      fullName: "David Miller",
      gender: "male",
      height: { value: 175, unit: "cm" },
      weight: { value: 82, unit: "kg" },
      dateOfBirth: new Date("1980-11-03"),
      email: "david.miller@example.com",
      profileImage: "/uploads/users/patient-2.png",
      password: DEFAULT_PASSWORD_HASH,
      callingCode: "+1",
      phoneNumber: 1734456899,
      address: "789 Park Avenue, Brooklyn, NY 11201",
      medicalCondition: ["Hypertension Stage 1"],
      role: "user",
      isEmailVerified: true,
      isProfileCompleted: true,
      chartCredits: 10,
      appointmentCredits: 2,
      subscription: {
        status: "active",
        isSubscriptionTaken: true,
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1a1000000000000000004"),
      userName: "emily_clark",
      firstName: "Emily",
      lastName: "Clark",
      fullName: "Emily Clark",
      gender: "female",
      height: { value: 168, unit: "cm" },
      weight: { value: 58, unit: "kg" },
      dateOfBirth: new Date("1996-03-17"),
      email: "emily.clark@example.com",
      profileImage: "/uploads/users/patient-3.png",
      password: DEFAULT_PASSWORD_HASH,
      callingCode: "+1",
      phoneNumber: 1734456912,
      address: "12 Pine Street, Queens, NY 11101",
      medicalCondition: ["Contact Dermatitis"],
      role: "user",
      isEmailVerified: true,
      isProfileCompleted: true,
      chartCredits: 10,
      appointmentCredits: 1,
      subscription: {
        status: "free",
        isSubscriptionTaken: false,
      },
    },
  ]);
  console.log(`Seeded ${users.length} Users successfully.`);

  const superAdmin = users[0];
  const patientSarah = users[1];
  const patientDavid = users[2];
  const patientEmily = users[3];

  // 2. Seed Team (Doctors / Specialists)
  console.log("Seeding Team (Doctors)...");
  const doctors = await Team.create([
    {
      _id: new mongoose.Types.ObjectId("65f1b2000000000000000001"),
      createdBy: superAdmin._id,
      firstName: "Alexander",
      lastName: "Wright",
      fullName: "Dr. Alexander Wright, MD, FACP",
      designation: "Chief Medical Officer & Senior Physician",
      specialties: "Internal Medicine & Preventive Healthcare",
      about:
        "Dr. Alexander Wright is a board-certified internist with over 15 years of clinical practice dedicated to comprehensive diagnostic medicine, chronic disease management, and preventive wellness. He completed his residency at Johns Hopkins Hospital and has published over 25 peer-reviewed papers.",
      callingCode: "+1",
      phoneNumber: 2125550198,
      email: "dr.wright@trustedgpclinic.com",
      profileImage: "/uploads/users/doctor-1.png",
      media: {
        facebook: "https://facebook.com/dr.alex.wright",
        instagram: "https://instagram.com/dralexwright",
        linkedin: "https://linkedin.com/in/dralexwright",
        X: "https://x.com/dralexwright",
      },
      isAdmin: true,
      degrees: [
        {
          school: "Harvard Medical School",
          degree: "Doctor of Medicine (MD)",
          subject: "Internal Medicine",
          grade: "Summa Cum Laude",
          startDate: new Date("2004-09-01"),
          endDate: new Date("2008-06-15"),
          skills: ["Clinical Diagnostics", "Patient Care", "Internal Medicine"],
          status: "completed",
        },
        {
          school: "Princeton University",
          degree: "Bachelor of Science",
          subject: "Molecular Biology",
          grade: "Honors",
          startDate: new Date("2000-09-01"),
          endDate: new Date("2004-05-30"),
          skills: ["Biochemistry", "Molecular Genetics"],
          status: "completed",
        },
      ],
      experience: [
        {
          title: "Chief Medical Officer",
          employmentType: "Full-time",
          company: "Trusted GP Clinic",
          location: "New York, NY",
          startDate: new Date("2021-01-15"),
          endDate: null,
          description:
            "Lead physician overseeing outpatient clinical standards, telehealth consultations, and diagnostic protocol adherence.",
          profileHeadline: "Pioneering accessible, evidence-based preventive care.",
          skills: ["Clinical Leadership", "Telehealth", "Preventive Care"],
          status: "current",
        },
        {
          title: "Senior Attending Physician",
          employmentType: "Full-time",
          company: "Manhattan Health System",
          location: "New York, NY",
          startDate: new Date("2014-07-01"),
          endDate: new Date("2020-12-31"),
          description:
            "Managed acute and chronic cases in inpatient internal medicine wards and trained resident physicians.",
          profileHeadline: "Dedicated patient advocate and clinical instructor.",
          skills: ["Chronic Disease Management", "Residency Training"],
          status: "completed",
        },
      ],
      achievements: [
        {
          title: "Top Doctor Award 2023",
          description: "Awarded by New York Healthcare Alliance for excellence in preventive outpatient medicine.",
          date: new Date("2023-11-10"),
          status: "achieved",
        },
        {
          title: "Distinguished Fellow - American College of Physicians",
          description: "Elected FACP for contributions to medical education and clinical research.",
          date: new Date("2020-04-15"),
          status: "achieved",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId("65f1b2000000000000000002"),
      createdBy: superAdmin._id,
      firstName: "Sophia",
      lastName: "Martinez",
      fullName: "Dr. Sophia Martinez, MD, FACC",
      designation: "Consultant Cardiologist",
      specialties: "Cardiology & Non-Invasive Cardiovascular Imaging",
      about:
        "Dr. Sophia Martinez specializes in non-invasive cardiology, preventive heart disease management, echocardiography, and vascular health. She has 12+ years of clinical experience diagnosing complex heart conditions.",
      callingCode: "+1",
      phoneNumber: 2125550145,
      email: "dr.martinez@trustedgpclinic.com",
      profileImage: "/uploads/users/doctor-2.png",
      media: {
        facebook: "https://facebook.com/drsophiamartinez",
        instagram: "https://instagram.com/drsophiamartinez",
        linkedin: "https://linkedin.com/in/drsophiamartinez",
        X: "https://x.com/drsophiamartinez",
      },
      isAdmin: false,
      degrees: [
        {
          school: "Columbia University Vagelos College of Physicians",
          degree: "Doctor of Medicine (MD)",
          subject: "Cardiovascular Medicine",
          grade: "Distinction",
          startDate: new Date("2007-09-01"),
          endDate: new Date("2011-06-01"),
          skills: ["Echocardiography", "Stress Testing", "Cardiology"],
          status: "completed",
        },
      ],
      experience: [
        {
          title: "Consultant Cardiologist",
          employmentType: "Full-time",
          company: "Trusted GP Clinic",
          location: "New York, NY",
          startDate: new Date("2018-08-01"),
          endDate: null,
          description:
            "Provide outpatient cardiac assessments, hypertension monitoring, and preventative heart wellness plans.",
          profileHeadline: "Advancing cardiac wellness through early detection.",
          skills: ["Cardiology", "Holter Monitoring"],
          status: "current",
        },
      ],
      achievements: [
        {
          title: "Cardiology Research Excellence Award",
          description: "Recognized by the American Heart Association for hypertension clinical research.",
          date: new Date("2022-09-18"),
          status: "achieved",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId("65f1b2000000000000000003"),
      createdBy: superAdmin._id,
      firstName: "Marcus",
      lastName: "Chen",
      fullName: "Dr. Marcus Chen, MD, FAAD",
      designation: "Consultant Dermatologist",
      specialties: "Medical Dermatology & Cutaneous Surgery",
      about:
        "Dr. Marcus Chen provides expert diagnosis and personalized medical treatments for a wide variety of dermatological conditions including eczema, psoriasis, acne, skin cancer screenings, and allergy skin reactions.",
      callingCode: "+1",
      phoneNumber: 2125550187,
      email: "dr.chen@trustedgpclinic.com",
      profileImage: "/uploads/users/doctor-3.png",
      media: {
        facebook: "https://facebook.com/drmarcuschen",
        instagram: "https://instagram.com/drmarcuschen",
        linkedin: "https://linkedin.com/in/drmarcuschen",
        X: "https://x.com/drmarcuschen",
      },
      isAdmin: false,
      degrees: [
        {
          school: "Stanford University School of Medicine",
          degree: "Doctor of Medicine (MD)",
          subject: "Dermatology",
          grade: "Honors",
          startDate: new Date("2009-09-01"),
          endDate: new Date("2013-06-15"),
          skills: ["Dermatopathology", "Skin Biopsy", "Cryotherapy"],
          status: "completed",
        },
      ],
      experience: [
        {
          title: "Attending Dermatologist",
          employmentType: "Full-time",
          company: "Trusted GP Clinic",
          location: "New York, NY",
          startDate: new Date("2019-03-01"),
          endDate: null,
          description:
            "Specialized in complex skin allergies, dermoscopy evaluations, and minimally invasive dermatologic procedures.",
          profileHeadline: "Healthy skin through personalized clinical dermatology.",
          skills: ["Medical Dermatology", "Skin Cancer Screening"],
          status: "current",
        },
      ],
      achievements: [
        {
          title: "National Skin Health Innovation Recognition",
          description: "Awarded by the American Academy of Dermatology.",
          date: new Date("2023-05-20"),
          status: "achieved",
        },
      ],
    },
    {
      _id: new mongoose.Types.ObjectId("65f1b2000000000000000004"),
      createdBy: superAdmin._id,
      firstName: "Rachel",
      lastName: "Green",
      fullName: "Dr. Rachel Green, MD, FAAP",
      designation: "Senior Pediatrician",
      specialties: "Pediatrics & Child Developmental Care",
      about:
        "Dr. Rachel Green is dedicated to the health and development of children from newborns to adolescents. Passionate about developmental milestones, nutritional guidance, and pediatric immunizations with over 10 years of experience.",
      callingCode: "+1",
      phoneNumber: 2125550162,
      email: "dr.green@trustedgpclinic.com",
      profileImage: "/uploads/users/doctor-4.png",
      media: {
        facebook: "https://facebook.com/drrachelgreen",
        instagram: "https://instagram.com/drrachelgreen",
        linkedin: "https://linkedin.com/in/drrachelgreen",
        X: "https://x.com/drrachelgreen",
      },
      isAdmin: false,
      degrees: [
        {
          school: "University of Pennsylvania Perelman School of Medicine",
          degree: "Doctor of Medicine (MD)",
          subject: "Pediatrics",
          grade: "High Honors",
          startDate: new Date("2010-09-01"),
          endDate: new Date("2014-05-20"),
          skills: ["Pediatric Care", "Child Nutrition", "Immunizations"],
          status: "completed",
        },
      ],
      experience: [
        {
          title: "Senior Pediatric Care Specialist",
          employmentType: "Full-time",
          company: "Trusted GP Clinic",
          location: "New York, NY",
          startDate: new Date("2020-09-01"),
          endDate: null,
          description:
            "Lead clinician for pediatric wellness exams, routine vaccinations, and adolescent preventative health.",
          profileHeadline: "Caring for your family's next generation with tenderness and expertise.",
          skills: ["Pediatrics", "Developmental Screening"],
          status: "current",
        },
      ],
      achievements: [
        {
          title: "Outstanding Community Pediatrician Award 2024",
          description: "Honored for pediatric preventative health programs.",
          date: new Date("2024-03-12"),
          status: "achieved",
        },
      ],
    },
  ]);
  console.log(`Seeded ${doctors.length} Doctors (Team) successfully.`);

  const doctorWright = doctors[0];
  const doctorMartinez = doctors[1];
  const doctorChen = doctors[2];
  const doctorGreen = doctors[3];

  // 3. Seed Schedules for Doctors
  console.log("Seeding Schedules...");
  const schedules = await Schedule.create([
    // Dr. Wright Schedules
    {
      userId: doctorWright._id,
      type: "recurring",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "13:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorWright._id,
      type: "recurring",
      dayOfWeek: "Wednesday",
      startTime: "14:00",
      endTime: "18:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorWright._id,
      type: "recurring",
      dayOfWeek: "Friday",
      startTime: "10:00",
      endTime: "16:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorWright._id,
      type: "one-time",
      date: new Date(Date.now() + 86400000 * 3),
      startTime: "09:30",
      endTime: "12:30",
      timezone: "America/New_York",
      status: "active",
    },

    // Dr. Martinez Schedules
    {
      userId: doctorMartinez._id,
      type: "recurring",
      dayOfWeek: "Tuesday",
      startTime: "09:00",
      endTime: "15:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorMartinez._id,
      type: "recurring",
      dayOfWeek: "Thursday",
      startTime: "10:00",
      endTime: "17:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },

    // Dr. Chen Schedules
    {
      userId: doctorChen._id,
      type: "recurring",
      dayOfWeek: "Monday",
      startTime: "13:00",
      endTime: "19:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorChen._id,
      type: "recurring",
      dayOfWeek: "Saturday",
      startTime: "10:00",
      endTime: "14:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },

    // Dr. Green Schedules
    {
      userId: doctorGreen._id,
      type: "recurring",
      dayOfWeek: "Wednesday",
      startTime: "08:30",
      endTime: "14:30",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
    {
      userId: doctorGreen._id,
      type: "recurring",
      dayOfWeek: "Friday",
      startTime: "09:00",
      endTime: "15:00",
      timezone: "America/New_York",
      repeatRule: "weekly",
      status: "active",
    },
  ]);
  console.log(`Seeded ${schedules.length} Schedules successfully.`);

  // 4. Seed Subscriptions
  console.log("Seeding Subscriptions...");
  const subscriptions = await Subscription.create([
    {
      _id: new mongoose.Types.ObjectId("65f1c3000000000000000001"),
      createdBy: superAdmin._id,
      title: "Basic Health Plan",
      limitation: "monthly",
      stripePriceId: "price_basic_monthly_01",
      days: 30,
      amount: 29.99,
      features: [
        "2 Virtual Doctor Consultations per month",
        "Unlimited Health Records Storage",
        "Priority Email & Chat Support",
        "Access to Certified Wellness Articles",
        "Digital Prescription Refills",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId("65f1c3000000000000000002"),
      createdBy: superAdmin._id,
      title: "Family Care Annual",
      limitation: "annual",
      stripePriceId: "price_family_annual_02",
      days: 365,
      amount: 299.99,
      features: [
        "Unlimited Consultations for up to 4 Family Members",
        "Free Home Prescription Deliveries",
        "24/7 Dedicated Care Hotline",
        "Annual Full Body Diagnostic Checkup Discounts",
        "Direct Messaging with Specialist Doctors",
        "Zero Wait-Time Priority Scheduling",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId("65f1c3000000000000000003"),
      createdBy: superAdmin._id,
      title: "VIP On-Demand Weekly",
      limitation: "weekly",
      stripePriceId: "price_vip_weekly_03",
      days: 7,
      amount: 14.99,
      features: [
        "Same-Day Urgent Virtual Consultations",
        "Full Prescription Review & Second Opinion",
        "Direct Video Consult with Chief Medical Officer",
      ],
    },
  ]);
  console.log(`Seeded ${subscriptions.length} Subscriptions successfully.`);

  // Attach subscription references to users
  await User.findByIdAndUpdate(patientSarah._id, {
    "subscription.subscriptionId": subscriptions[0]._id,
    "subscription.stripeSubId": "sub_test_sarah_001",
    "subscription.subscriptionExpirationDate": new Date(Date.now() + 86400000 * 30),
    "subscription.status": "active",
    "subscription.isSubscriptionTaken": true,
  });

  await User.findByIdAndUpdate(patientDavid._id, {
    "subscription.subscriptionId": subscriptions[1]._id,
    "subscription.stripeSubId": "sub_test_david_002",
    "subscription.subscriptionExpirationDate": new Date(Date.now() + 86400000 * 365),
    "subscription.status": "active",
    "subscription.isSubscriptionTaken": true,
  });

  // 5. Seed Appointments
  console.log("Seeding Appointments...");
  const appointments = await Appointment.create([
    {
      _id: new mongoose.Types.ObjectId("65f1d4000000000000000001"),
      appointmentId: "APT10001",
      booker: patientSarah._id,
      doctor: superAdmin._id,
      patientName: "Sarah Johnson",
      patientEmail: "user@gmail.com",
      patientPhone: "+12125550123",
      patientAge: 32,
      patientGender: "female",
      patientAddress: "456 Elm Street, Apt 3B, New York, NY 10002",
      visitType: "New Patient Visit",
      category: "General Consultation",
      department: "Internal Medicine",
      bodyPart: "Head & Neck",
      specificConditions: "Persistent migraine and morning fatigue",
      date: new Date(Date.now() + 86400000 * 2),
      timeSlot: "10:00 AM - 10:30 AM",
      reason: "Experiencing recurring headaches and daytime drowsiness for the past 3 weeks.",
      status: "confirmed",
      isPaid: true,
      amount: 75,
      paymentDetails: {
        method: "card",
        transactionId: "TXN_78291038",
        paidAt: new Date(),
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1d4000000000000000002"),
      appointmentId: "APT10002",
      booker: patientDavid._id,
      doctor: superAdmin._id,
      patientName: "David Miller",
      patientEmail: "david.miller@example.com",
      patientPhone: "+12125550144",
      patientAge: 45,
      patientGender: "male",
      patientAddress: "789 Park Ave, Brooklyn, NY 11201",
      visitType: "Old Patient Visit",
      category: "Cardiology Follow-up",
      department: "Cardiology",
      bodyPart: "Chest & Heart",
      specificConditions: "Hypertension monitoring",
      date: new Date(Date.now() + 86400000 * 4),
      timeSlot: "02:00 PM - 02:30 PM",
      reason: "Quarterly review of blood pressure medication dosage and lab results.",
      status: "confirmed",
      isPaid: true,
      amount: 90,
      paymentDetails: {
        method: "online",
        transactionId: "TXN_99182374",
        paidAt: new Date(),
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1d4000000000000000003"),
      appointmentId: "APT10003",
      booker: patientEmily._id,
      doctor: superAdmin._id,
      patientName: "Emily Clark",
      patientEmail: "emily.clark@example.com",
      patientPhone: "+12125550189",
      patientAge: 28,
      patientGender: "female",
      patientAddress: "12 Pine St, Queens, NY 11101",
      visitType: "Specific Concern",
      category: "Dermatology",
      department: "Dermatology",
      bodyPart: "Skin & Arms",
      specificConditions: "Allergic contact dermatitis",
      date: new Date(Date.now() + 86400000 * 6),
      timeSlot: "11:30 AM - 12:00 PM",
      reason: "Skin irritation and itching developed on arms after using new skin lotion.",
      status: "pending",
      isPaid: false,
      amount: 80,
      paymentDetails: {
        method: "cash",
      },
    },
    {
      _id: new mongoose.Types.ObjectId("65f1d4000000000000000004"),
      appointmentId: "APT10004",
      booker: patientSarah._id,
      doctor: superAdmin._id,
      patientName: "Sarah Johnson",
      patientEmail: "user@gmail.com",
      patientPhone: "+12125550123",
      patientAge: 32,
      patientGender: "female",
      patientAddress: "456 Elm Street, Apt 3B, New York, NY 10002",
      visitType: "Old Patient Visit",
      category: "Routine Physical",
      department: "Internal Medicine",
      bodyPart: "General Body",
      specificConditions: "Annual routine checkup",
      date: new Date(Date.now() - 86400000 * 10),
      timeSlot: "09:00 AM - 09:30 AM",
      reason: "Comprehensive annual physical examination and preventative wellness screening.",
      status: "completed",
      isPaid: true,
      amount: 75,
      paymentDetails: {
        method: "card",
        transactionId: "TXN_11223344",
        paidAt: new Date(Date.now() - 86400000 * 10),
      },
    },
  ]);
  console.log(`Seeded ${appointments.length} Appointments successfully.`);

  const apt1 = appointments[0];
  const apt2 = appointments[1];
  const apt4 = appointments[3];

  // 6. Seed Documents
  console.log("Seeding Documents...");
  const documents = await Document.create([
    {
      user: patientSarah._id,
      sendBy: superAdmin._id,
      appointment: apt4._id,
      title: "Annual Physical Prescription & Care Instructions",
      description: "Prescription for Vitamin D3 2000IU daily and Omega-3 capsules following annual physical exam.",
      type: "prescription",
      files: ["/uploads/documents/prescription_sarah_johnson_2026.pdf"],
    },
    {
      user: patientDavid._id,
      sendBy: superAdmin._id,
      appointment: apt2._id,
      title: "Comprehensive Metabolic & Lipid Panel Results",
      description: "Biochemical blood analysis and lipid profile showing optimal kidney and liver metrics.",
      type: "lab reports",
      files: ["/uploads/documents/lab_report_david_miller.pdf"],
    },
    {
      user: patientSarah._id,
      sendBy: superAdmin._id,
      title: "Official Medical Fitness & Travel Clearance",
      description: "Clinical certificate of good health certifying fitness for international travel and routine exercise.",
      type: "medical certificate",
      files: ["/uploads/documents/clearance_certificate_sarah.pdf"],
    },
  ]);
  console.log(`Seeded ${documents.length} Documents successfully.`);

  // 7. Seed Blogs
  console.log("Seeding Blogs...");
  const blogs = await Blog.create([
    {
      _id: new mongoose.Types.ObjectId("65f1e5000000000000000001"),
      title: "Understanding Cardiovascular Health: 5 Daily Habits for a Stronger Heart",
      slug: "understanding-cardiovascular-health-5-daily-habits",
      summary: "Discover essential lifestyle habits recommended by certified cardiologists to optimize heart health, regulate blood pressure, and prevent coronary disease.",
      content: `Cardiovascular disease remains the leading cause of health complications worldwide, yet medical studies show that up to 80% of premature cardiac events are entirely preventable through proactive daily lifestyle choices.

In this comprehensive clinical guide, our internal medicine and cardiology specialists review five scientifically backed habits:

1. Adhere to an Anti-Inflammatory Diet: Prioritize Mediterranean-style nutrition rich in leafy greens, extra-virgin olive oil, wild-caught salmon, and antioxidant berries.
2. Engage in Consistent Aerobic Activity: 30 minutes of moderate aerobic exercise (such as brisk walking, swimming, or cycling) strengthens myocardial efficiency.
3. Prioritize Restorative Sleep: Maintaining 7 to 8 hours of uninterrupted sleep normalizes vascular tone and reduces nighttime cortisol spikes.
4. Active Stress Modulation: Chronic psychosocial stress drives arterial stiffness. Incorporate 10 minutes of daily diaphragmatic breathing or mindfulness.
5. Routine Diagnostic Screening: Regular blood pressure, lipid, and fasting glucose monitoring allows for early detection long before symptoms emerge.`,
      coverImage: "/uploads/blogs/cardio-health.jpg",
      tags: ["cardiology", "heart health", "wellness", "prevention"],
      category: "Cardiology",
      author: superAdmin._id,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 15),
      views: 1240,
      likes: 88,
      commentsCount: 2,
    },
    {
      _id: new mongoose.Types.ObjectId("65f1e5000000000000000002"),
      title: "Pediatric Immunization Guide: What Every New Parent Needs to Know",
      slug: "pediatric-immunization-guide-for-parents",
      summary: "A reassuring, factual overview of vaccine timelines and how childhood immunizations safeguard your child's developmental milestones.",
      content: `Navigating your infant's immunization calendar can feel daunting for new parents. Pediatric vaccines undergo decades of safety testing and stringent clinical surveillance, protecting children against life-threatening illnesses such as measles, mumps, rubella, and whooping cough.

In this article, our pediatric department breaks down the key immunization milestones from infancy through kindergarten, addressing safety concerns, common mild side effects (such as low-grade fever), and the critical role of community herd immunity in protecting immunocompromised infants.`,
      coverImage: "/uploads/blogs/pediatric-care.jpg",
      tags: ["pediatrics", "immunization", "childcare", "parenting"],
      category: "Pediatrics",
      author: superAdmin._id,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 8),
      views: 850,
      likes: 64,
      commentsCount: 1,
    },
    {
      _id: new mongoose.Types.ObjectId("65f1e5000000000000000003"),
      title: "Managing Seasonal Allergies: Prevention, Treatments, and Modern Therapies",
      slug: "managing-seasonal-allergies-treatments",
      summary: "Learn how to differentiate seasonal allergic rhinitis from viral infections and explore modern therapeutic options.",
      content: `As seasonal pollen levels fluctuate, millions suffer from itchy eyes, nasal congestion, and sinus headaches. 

We examine evidence-based interventions:
- HEPA air filtration at home to minimize nighttime allergen load.
- Second-generation antihistamines that offer non-sedating symptom relief.
- Saline nasal rinses to mechanically flush out inhaled particulates.
- Sublingual immunotherapy (SLIT) for long-term desensitization in refractory cases.`,
      coverImage: "/uploads/blogs/allergy-care.jpg",
      tags: ["allergies", "respiratory", "general health", "dermatology"],
      category: "General Medicine",
      author: superAdmin._id,
      isPublished: true,
      publishedAt: new Date(Date.now() - 86400000 * 3),
      views: 620,
      likes: 42,
      commentsCount: 1,
    },
  ]);
  console.log(`Seeded ${blogs.length} Blogs successfully.`);

  // 8. Seed Comments on Blogs
  console.log("Seeding Comments...");
  const comments = await Comment.create([
    {
      user: patientSarah._id,
      name: "Sarah Johnson",
      email: "user@gmail.com",
      content: "This article was exceptionally informative! I have started doing 30 minutes of brisk morning walks and tracking my heart rate.",
      blog: blogs[0]._id,
      isApproved: true,
    },
    {
      user: patientDavid._id,
      name: "David Miller",
      email: "david.miller@example.com",
      content: "Great clinical perspective on managing stress and keeping blood pressure within safe ranges. Thank you Dr. Wright!",
      blog: blogs[0]._id,
      isApproved: true,
    },
    {
      user: patientEmily._id,
      name: "Emily Clark",
      email: "emily.clark@example.com",
      content: "Such a comforting guide for new parents. The timeline breakdown makes planning appointments so much simpler.",
      blog: blogs[1]._id,
      isApproved: true,
    },
  ]);
  console.log(`Seeded ${comments.length} Comments successfully.`);

  // 9. Seed Conversations & Messages
  console.log("Seeding Conversations & Messages...");
  const conversationId = new mongoose.Types.ObjectId("65f1f6000000000000000001");

  const messages = await MessageModel.create([
    {
      _id: new mongoose.Types.ObjectId("65f1f6000000000000000011"),
      conversationId: conversationId,
      text: "Hello Dr. Wright, I submitted my appointment request for the upcoming headache consultation.",
      type: "text",
      seen: true,
      msgByUserId: patientSarah._id,
    },
    {
      _id: new mongoose.Types.ObjectId("65f1f6000000000000000012"),
      conversationId: conversationId,
      text: "Hello Sarah, I have confirmed your appointment. Please maintain a symptom log noting any specific food or screen time triggers over the next 48 hours.",
      type: "text",
      seen: true,
      msgByUserId: superAdmin._id,
    },
    {
      _id: new mongoose.Types.ObjectId("65f1f6000000000000000013"),
      conversationId: conversationId,
      text: "Thank you doctor! I have already started noting my sleep schedule and meals in the patient journal.",
      type: "text",
      seen: false,
      msgByUserId: patientSarah._id,
    },
  ]);

  await ConversationModel.create({
    _id: conversationId,
    title: "Consultation - Sarah Johnson",
    sender: patientSarah._id,
    receiver: superAdmin._id,
    appointmentId: apt1._id,
    lastMessage: messages[2]._id,
    messages: messages.map((m) => m._id),
    status: "active",
    blockStatus: "unblocked",
  });
  console.log("Seeded 1 Conversation and 3 Messages successfully.");

  // 10. Seed Transactions
  console.log("Seeding Transactions...");
  const transactions = await Transaction.create([
    {
      user: patientSarah._id,
      amount: 75,
      appointment: apt1._id,
      striperPiceId: "price_appointment_general",
      checkoutSessionId: "cs_test_apt_sarah_1001",
      mode: "payment",
      status: "completed",
      stripeInfo: {
        payment_intent: "pi_3Mtwx72eZvKYlo2C19mN9876",
        currency: "usd",
        payment_method_types: ["card"],
      },
    },
    {
      user: patientDavid._id,
      amount: 90,
      appointment: apt2._id,
      striperPiceId: "price_appointment_specialist",
      checkoutSessionId: "cs_test_apt_david_1002",
      mode: "payment",
      status: "completed",
      stripeInfo: {
        payment_intent: "pi_4Nuxy83eZvKYlo2C20mO1234",
        currency: "usd",
        payment_method_types: ["card"],
      },
    },
    {
      user: patientSarah._id,
      amount: 29.99,
      striperPiceId: "price_basic_monthly_01",
      checkoutSessionId: "cs_test_sub_sarah_2001",
      mode: "subscription",
      status: "completed",
      stripeInfo: {
        payment_intent: "pi_5Ovyz94eZvKYlo2C21nP5678",
        currency: "usd",
      },
    },
  ]);
  console.log(`Seeded ${transactions.length} Transactions successfully.`);

  // 11. Seed Values
  console.log("Seeding Clinic Values...");
  const clinicValues = await Values.create([
    {
      name: "Patient-Centered Compassion",
      description: "We place our patients at the heart of every clinical decision, delivering empathetic, individualized medical care tailored to your family's needs.",
      icon: "heart-pulse",
    },
    {
      name: "Clinical Excellence & Integrity",
      description: "Our board-certified physicians adhere to the highest international healthcare standards, rigorous training, and cutting-edge evidence-based medicine.",
      icon: "award",
    },
    {
      name: "Uncompromising Privacy & Trust",
      description: "We protect your medical data with enterprise-grade encryption and adhere to strict patient confidentiality and ethical clinical guidelines.",
      icon: "shield-check",
    },
    {
      name: "Accessible Digital Healthcare",
      description: "Bridging the distance between patients and specialists through seamless telehealth video consultations, instant booking, and electronic health records.",
      icon: "laptop-medical",
    },
  ]);
  console.log(`Seeded ${clinicValues.length} Clinic Values successfully.`);

  // 12. Seed Contacts
  console.log("Seeding Contacts...");
  const contacts = await Contact.create([
    {
      firstName: "Michael",
      lastName: "Brown",
      fullName: "Michael Brown",
      email: "michael.brown@example.com",
      phoneNumber: "+12125550341",
      address: "320 West 42nd Street, New York, NY",
      message: "Hello, I would like to inquire if your clinic accepts BlueCross BlueShield insurance for outpatient cardiology consultations.",
    },
    {
      firstName: "Amanda",
      lastName: "Taylor",
      fullName: "Amanda Taylor",
      email: "amanda.taylor@example.com",
      phoneNumber: "+12125550982",
      address: "55 Wall Street, New York, NY",
      message: "Can I schedule a pediatric wellness exam for my twin toddlers on a Saturday morning with Dr. Rachel Green?",
    },
  ]);
  console.log(`Seeded ${contacts.length} Contacts successfully.`);

  // 13. Seed FAQs
  console.log("Seeding FAQs...");
  const faqs = await FAQ.create([
    {
      question: "How do I book an appointment with a specialist doctor?",
      answer: "You can book directly through our online portal by selecting your preferred doctor, choosing an available date and time slot, and submitting your basic health details. You will receive an instant confirmation via email and SMS.",
    },
    {
      question: "What documents should I prepare before my first consultation?",
      answer: "Please have a government-issued photo ID, your insurance card (if applicable), a list of current medications you are taking, and copies of any relevant prior medical records or laboratory results ready.",
    },
    {
      question: "Can I reschedule or cancel my booked appointment without fees?",
      answer: "Yes, you can reschedule or cancel your appointment up to 24 hours prior to the scheduled consultation time directly from your patient dashboard with zero cancellation penalties.",
    },
    {
      question: "How do virtual video consultations work on this platform?",
      answer: "Our virtual consultations take place through a secure, encrypted video link provided in your patient dashboard and confirmation email. Simply click the link 5 minutes prior to your scheduled appointment on your smartphone or computer.",
    },
    {
      question: "How quickly are prescription renewal requests processed?",
      answer: "Standard prescription renewal requests submitted through the patient portal are reviewed and processed by our attending medical team within 24 to 48 business hours.",
    },
  ]);
  console.log(`Seeded ${faqs.length} FAQs successfully.`);

  // 14. Seed Notifications
  console.log("Seeding Notifications...");
  const notifications = await Notification.create([
    {
      userId: patientSarah._id,
      sendBy: superAdmin._id,
      appointmentId: apt1._id,
      role: "user",
      title: "Appointment Confirmed",
      content: "Your appointment with Dr. Alexander Wright has been confirmed for 10:00 AM.",
      status: "unread",
      priority: "high",
      type: "appointment",
    },
    {
      userId: superAdmin._id,
      sendBy: patientSarah._id,
      appointmentId: apt1._id,
      role: "superAdmin",
      title: "New Patient Appointment Booked",
      content: "Sarah Johnson has booked an Internal Medicine consultation.",
      status: "read",
      priority: "medium",
      type: "appointment",
    },
    {
      userId: patientSarah._id,
      sendBy: superAdmin._id,
      role: "user",
      title: "Prescription Ready for Download",
      content: "Your official medical prescription document has been generated and is now ready in your Documents tab.",
      status: "read",
      priority: "medium",
      type: "document",
    },
  ]);
  console.log(`Seeded ${notifications.length} Notifications successfully.`);

  // 15. Seed Policy & Static Documents
  console.log("Seeding Policies & Clinic Information...");
  await TermsAndCondition.create({
    content: `TERMS AND CONDITIONS OF SERVICE
Effective Date: January 1, 2026

1. ACCEPTANCE OF TERMS
By accessing or using the Trusted GP Clinic platform, you agree to be bound by these Terms and Conditions. If you do not agree to all terms, do not access or use our services.

2. MEDICAL SERVICES AND TELEHEALTH
The healthcare services provided through this platform include in-person consultations, telemedicine video sessions, diagnostic test reviews, and electronic prescription issuing. Telehealth services are not intended for emergency situations. If you are experiencing a life-threatening medical emergency, call 911 or visit the nearest emergency room immediately.

3. APPOINTMENTS AND CANCELLATIONS
Appointments may be rescheduled or cancelled up to 24 hours prior to the appointment time without penalty. Late cancellations or unattended appointments may be subject to a standard cancellation fee.

4. USER RESPONSIBILITIES AND ACCURACY
You represent that all information provided during registration and clinical intake, including medical history, medication lists, and identity documentation, is truthful, accurate, and up to date.

5. PAYMENTS AND BILLING
All fees for consultations, memberships, and auxiliary services are billed in accordance with the published fee schedule. Payments are securely processed via certified PCI-DSS compliant gateways.`,
  });

  await AboutUs.create({
    content: `ABOUT TRUSTED GP CLINIC
Dedicated to Comprehensive, Modern, and Compassionate Care

Founded with a vision to make premium outpatient medicine accessible and patient-centered, Trusted GP Clinic combines world-class diagnostic expertise with the convenience of state-of-the-art telehealth technology.

Our multidisciplinary medical team comprises board-certified specialists in Internal Medicine, Cardiology, Dermatology, and Pediatrics. We believe that true healthcare goes far beyond symptom suppression—we focus on preventative wellness, personalized chronic disease management, and empowering every individual with actionable health literacy.

With thousands of consultations conducted, an in-house digital health record system, and 24/7 patient support, we are proud to be your family's trusted healthcare partner.`,
  });

  await PrivacyPolicy.create({
    content: `PRIVACY POLICY & HEALTH DATA PROTECTION
Effective Date: January 1, 2026

Trusted GP Clinic is committed to protecting your personal information and protected health information (PHI) in strict compliance with HIPAA (Health Insurance Portability and Accountability Act) and applicable international privacy standards.

1. INFORMATION WE COLLECT
We collect personal identification data (full name, date of birth, contact details), clinical history, symptom logs, consultation notes, prescription records, and secure billing information.

2. HOW WE USE YOUR INFORMATION
Your information is exclusively utilized to:
- Deliver direct medical diagnosis, consultation, and treatment planning.
- Process prescription orders and diagnostic referrals.
- Securely communicate appointment reminders, test results, and care plans.
- Facilitate secure payment processing.

3. DATA SECURITY MEASURES
All electronic records are encrypted using AES-256 encryption at rest and TLS 1.3 in transit. Access to your clinical data is strictly restricted to your authorized attending physicians and care coordinators. We never sell or share patient information with third-party advertisers.`,
  });

  await ChildSafetyPolicy.create({
    content: `CHILD SAFETY & PEDIATRIC SAFEGUARDING POLICY
Effective Date: January 1, 2026

Trusted GP Clinic maintains zero tolerance for child harm, abuse, neglect, or exploitation. This policy governs all pediatric consultations, digital communications, and clinical engagements involving minors under the age of 18.

1. MANDATORY PARENTAL/GUARDIAN CONSENT
All medical consultations, telemedicine visits, and health record access for patients under the age of 18 require documented verification of parental or legal guardian consent, except where explicitly permitted by law.

2. TELEHEALTH SAFEGUARDING STANDARDS
A parent or legally authorized adult guardian must be present during all video and audio telehealth sessions involving pediatric patients.

3. MANDATED REPORTING
All healthcare practitioners and administrative staff at Trusted GP Clinic are legally mandated reporters. Any reasonable suspicion of child neglect, physical abuse, or emotional harm will be reported immediately to child welfare authorities and law enforcement in accordance with state and federal laws.`,
  });

  await Support.create({
    content: `PATIENT SUPPORT & ASSISTANCE CENTER

We are here to assist you with technical help, appointment scheduling, billing questions, and prescription inquiries.

CONTACT CHANNELS:
- Telephone Support: +1 (800) 555-CARE (Mon - Sat: 8:00 AM - 8:00 PM EST)
- General Inquiries: support@trustedgpclinic.com
- Clinical Coordination: care@trustedgpclinic.com
- Emergency Note: For life-threatening emergencies, dial 911 immediately.

FREQUENTLY ASSISTED TOPICS:
- Video consultation connectivity and audio setup.
- Prescription renewal and pharmacy transfer requests.
- Invoice receipts and insurance claim documentation.
- Patient portal password reset and profile updates.`,
  });
  console.log("Seeded Policies and Clinic Info successfully.");

  console.log("\n=======================================================");
  console.log("  DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=======================================================");
  console.log("  Summary of Seeded Data:");
  console.log(`  - Users:             ${users.length} (1 SuperAdmin, 3 Patients)`);
  console.log(`  - Team (Doctors):    ${doctors.length} (CMO, Cardiologist, Dermatologist, Pediatrician)`);
  console.log(`  - Schedules:         ${schedules.length} (Recurring & One-time doctor slots)`);
  console.log(`  - Subscriptions:     ${subscriptions.length} (Monthly, Annual, Weekly VIP)`);
  console.log(`  - Appointments:      ${appointments.length} (Confirmed, Pending, Completed)`);
  console.log(`  - Documents:         ${documents.length} (Prescriptions, Lab Reports, Certificates)`);
  console.log(`  - Blogs:             ${blogs.length} (Cardiology, Pediatrics, General Medicine)`);
  console.log(`  - Comments:          ${comments.length} (Approved Patient Reviews)`);
  console.log(`  - Conversations:     1 Conversation with 3 Chat Messages`);
  console.log(`  - Transactions:      ${transactions.length} (Stripe Payments & Subscriptions)`);
  console.log(`  - Clinic Values:     ${clinicValues.length} Core Values`);
  console.log(`  - Contacts:          ${contacts.length} Patient Inquiries`);
  console.log(`  - FAQs:              ${faqs.length} Frequently Asked Questions`);
  console.log(`  - Notifications:     ${notifications.length} System Notifications`);
  console.log(`  - Static Policies:   Terms & Conditions, About Us, Privacy Policy, Child Safety, Support`);
  console.log("=======================================================\n");
  console.log("Default User Credentials for Login:");
  console.log("  Super Admin: evansceo246@gmail.com / Password123!");
  console.log("  Patient 1:   user@gmail.com / Password123!");
  console.log("  Patient 2:   david.miller@example.com / Password123!");
  console.log("  Patient 3:   emily.clark@example.com / Password123!");
  console.log("=======================================================\n");
};

const runSeeder = async () => {
  try {
    await connectDB();
    await cleanDatabase();
    await seedData();
  } catch (error) {
    console.error("Seeding failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
};

// If run directly via `node src/utils/seeder.js`
if (require.main === module) {
  runSeeder();
}

module.exports = {
  seedData,
  cleanDatabase,
};
