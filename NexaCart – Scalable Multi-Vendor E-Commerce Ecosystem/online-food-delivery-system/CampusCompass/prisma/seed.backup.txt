import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.savedCollege.deleteMany();
  await prisma.review.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  // Create a default test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const testUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    },
  });

  console.log(`Created test user: ${testUser.email}`);

  // Create Colleges
  const collegesData = [
    {
      name: "Indian Institute of Technology (IIT), Bombay",
      location: "Mumbai",
      description: "Top engineering college in India known for its exceptional research, academic excellence, and world-class placements.",
      fees: 220000,
      rating: 4.8,
      placementPercentage: 96.0,
      imageUrl: "/images/colleges/engineering.png",
      courses: ["B.Tech Computer Science", "B.Tech Electrical Engineering", "M.Tech Microelectronics"],
      reviews: {
        create: [
          { rating: 5, comment: "Exceptional professors and research labs. Truly world-class campus life.", userName: "Aarav Sharma" },
          { rating: 4, comment: "Extremely competitive environment, but the placements and exposure are unmatched.", userName: "Nikhil Gupta" }
        ]
      }
    },
    {
      name: "Indian Institute of Management (IIM), Bangalore",
      location: "Bangalore",
      description: "Premier business school in India, offering world-class postgraduate programs in management and business analytics.",
      fees: 1150000,
      rating: 4.9,
      placementPercentage: 100.0,
      imageUrl: "/images/colleges/business.png",
      courses: ["MBA General Management", "Executive MBA", "PGP in Business Analytics"],
      reviews: {
        create: [
          { rating: 5, comment: "Top-notch case studies and corporate guest lectures. The alumni network is massive.", userName: "Meera Nair" },
          { rating: 5, comment: "Incredible infrastructure and peer learning. Best 2 years of my academic life.", userName: "Rahul Verma" }
        ]
      }
    },
    {
      name: "All India Institute of Medical Sciences (AIIMS), Delhi",
      location: "Delhi",
      description: "The premier public medical research university and hospital in New Delhi, known for its high-quality affordable healthcare and education.",
      fees: 1600,
      rating: 4.7,
      placementPercentage: 98.0,
      imageUrl: "/images/colleges/medical.png",
      courses: ["MBBS", "MD Medicine", "MS Surgery"],
      reviews: {
        create: [
          { rating: 5, comment: "Great clinical exposure due to massive patient inflow. Best faculty in medicine.", userName: "Dr. Ananya Ray" },
          { rating: 4, comment: "Academics are highly demanding and work hours can be long, but the learning is top-tier.", userName: "Dr. Rohan Das" }
        ]
      }
    },
    {
      name: "Birla Institute of Technology and Science (BITS), Pilani",
      location: "Pilani",
      description: "A leading private deemed university known for its merit-based admission policy, entrepreneurship culture, and strong alumni network.",
      fees: 550000,
      rating: 4.5,
      placementPercentage: 92.0,
      imageUrl: "/images/colleges/engineering.png",
      courses: ["B.E. Computer Science", "B.E. Electronics & Communication", "M.E. Software Systems"],
      reviews: {
        create: [
          { rating: 5, comment: "No-attendance policy gives you freedom to build startups. Brilliant coding culture.", userName: "Tushar Bansal" }
        ]
      }
    },
    {
      name: "Delhi Technological University (DTU)",
      location: "Delhi",
      description: "A premier government state university in New Delhi, formerly known as Delhi College of Engineering, with a strong legacy in technical education.",
      fees: 219000,
      rating: 4.3,
      placementPercentage: 88.0,
      imageUrl: "/images/colleges/engineering.png",
      courses: ["B.Tech Information Technology", "B.Tech Mechanical Engineering", "M.Tech Computer Science"],
      reviews: {
        create: [
          { rating: 4, comment: "Excellent brand name in North India. Placements are very close to newer IITs.", userName: "Siddharth Malhotra" }
        ]
      }
    },
    {
      name: "Symbiosis Institute of Business Management (SIBM), Pune",
      location: "Pune",
      description: "A premier B-school in Pune known for its corporate connections, vibrant campus life, and excellent placement track record.",
      fees: 880000,
      rating: 4.4,
      placementPercentage: 97.0,
      imageUrl: "/images/colleges/business.png",
      courses: ["MBA Marketing", "MBA Finance", "MBA Human Resources"],
      reviews: {
        create: [
          { rating: 4, comment: "Beautiful hilltop campus. Industry exposure is great with top FMCG and consulting recruiters.", userName: "Kriti Sen" }
        ]
      }
    },
    {
      name: "Christian Medical College (CMC), Vellore",
      location: "Vellore",
      description: "A world-renowned private, minority-run medical school, hospital and research institute with a strong focus on community health and service.",
      fees: 48000,
      rating: 4.6,
      placementPercentage: 99.0,
      imageUrl: "/images/colleges/medical.png",
      courses: ["MBBS", "B.Sc Nursing", "MD Pediatrics"],
      reviews: {
        create: [
          { rating: 5, comment: "Focuses deeply on ethics and compassionate patient care. Excellent clinical rotations.", userName: "Dr. Rachel Thomas" }
        ]
      }
    },
    {
      name: "National Institute of Technology (NIT), Trichy",
      location: "Trichy",
      description: "The top-ranked NIT in India, recognized for its strong academic foundation, competitive atmosphere, and robust campus recruitment.",
      fees: 145000,
      rating: 4.4,
      placementPercentage: 91.0,
      imageUrl: "/images/colleges/engineering.png",
      courses: ["B.Tech Computer Science", "B.Tech Chemical Engineering", "M.C.A. Computer Applications"],
      reviews: {
        create: [
          { rating: 4, comment: "Rigorous curriculum, great campus culture, and strong coding community.", userName: "Karthik Raja" }
        ]
      }
    },
    {
      name: "Faculty of Management Studies (FMS), Delhi",
      location: "Delhi",
      description: "Affiliated with the University of Delhi, FMS is widely referred to as the 'Red Building of Dreams', famous for its exceptionally high ROI.",
      fees: 48000,
      rating: 4.6,
      placementPercentage: 99.0,
      imageUrl: "/images/colleges/business.png",
      courses: ["MBA Full-Time", "MBA Executive", "PhD Management"],
      reviews: {
        create: [
          { rating: 5, comment: "Lowest fees in the country with placement packages on par with Top 3 IIMs. Incredibly high ROI.", userName: "Abhishek Jain" }
        ]
      }
    },
    {
      name: "Armed Forces Medical College (AFMC), Pune",
      location: "Pune",
      description: "A premier medical institute in India acknowledged as a center of excellence for education and research, managed by the Indian Armed Forces.",
      fees: 25000,
      rating: 4.7,
      placementPercentage: 100.0,
      imageUrl: "/images/colleges/medical.png",
      courses: ["MBBS", "MD Anaesthesia", "MS Orthopaedics"],
      reviews: {
        create: [
          { rating: 5, comment: "Unique combination of medical education and military training. High discipline and best facilities.", userName: "Lt. Dr. Amit Sharma" }
        ]
      }
    }
  ];

  for (const college of collegesData) {
    const { courses, ...rest } = college;
    const createdCollege = await prisma.college.create({
      data: {
        ...rest,
        courses: {
          create: courses.map((name) => ({ name })),
        },
      },
    });
    console.log(`Created college: ${createdCollege.name}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
