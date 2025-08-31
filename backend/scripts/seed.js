const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      display_name: "Administrator",
    },
  });

  const modRole = await prisma.role.upsert({
    where: { name: "mod" },
    update: {},
    create: {
      name: "mod",
      display_name: "Moderator",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      display_name: "User",
    },
  });

  console.log("✅ Roles created");

  // Create admin user
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@truyendex.com" },
    update: {},
    create: {
      email: "admin@truyendex.com",
      name: "Administrator",
      password: hashedPassword,
      email_verified_at: new Date(),
    },
  });

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: adminRole.id,
    },
  });

  console.log("✅ Admin user created (admin@truyendex.com / admin123)");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
