import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all seed users (password: "password123")
  console.log('🔐 Hashing passwords...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        password: hashedPassword,
      } as any,
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
        password: hashedPassword,
      } as any,
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        password: hashedPassword,
      } as any,
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana Prince',
        password: hashedPassword,
      } as any,
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create posts
  console.log('📝 Creating posts...');
  const posts = await Promise.all([
    // Alice's posts
    prisma.post.create({
      data: {
        title: 'Getting Started with Prisma',
        content:
          "Prisma is an amazing ORM that makes database operations simple and type-safe. In this post, I'll share my experience setting up Prisma in a serverless environment.",
        published: true,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Building Scalable APIs',
        content:
          'When building APIs that need to scale, there are several key considerations: performance, maintainability, and developer experience.',
        published: true,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Draft: TypeScript Best Practices',
        content:
          'This is a draft post about TypeScript best practices. Still working on the content...',
        published: false,
        authorId: users[0].id,
      },
    }),

    // Bob's posts
    prisma.post.create({
      data: {
        title: 'Serverless Architecture Patterns',
        content:
          "Serverless computing has revolutionized how we build and deploy applications. Here are some common patterns I've discovered while working with serverless architectures.",
        published: true,
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Database Design for Modern Apps',
        content:
          'Designing databases for modern applications requires careful consideration of scalability, performance, and maintainability.',
        published: true,
        authorId: users[1].id,
      },
    }),

    // Charlie's posts
    prisma.post.create({
      data: {
        title: 'React Hooks Deep Dive',
        content:
          "React Hooks have transformed how we write React components. Let's explore some advanced patterns and best practices.",
        published: true,
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'State Management in 2025',
        content:
          "The landscape of state management in React has evolved significantly. Here's what you need to know about the current options.",
        published: true,
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Draft: Performance Optimization',
        content:
          'Working on a comprehensive guide to performance optimization...',
        published: false,
        authorId: users[2].id,
      },
    }),

    // Diana's posts
    prisma.post.create({
      data: {
        title: 'DevOps for Frontend Developers',
        content:
          'As a frontend developer, understanding DevOps practices can significantly improve your workflow and application reliability.',
        published: true,
        authorId: users[3].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Testing Strategies for Full-Stack Apps',
        content:
          'Comprehensive testing is crucial for maintaining code quality. Here are strategies for testing both frontend and backend components.',
        published: true,
        authorId: users[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // Display summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(
    `   Published posts: ${posts.filter((p: any) => p.published).length}`
  );
  console.log(
    `   Draft posts: ${posts.filter((p: any) => !p.published).length}`
  );

  console.log('\n🔐 Login Credentials:');
  console.log('   All users have the password: "password123"');
  console.log('   Available users:');
  console.log('   • alice@example.com (Alice Johnson)');
  console.log('   • bob@example.com (Bob Smith)');
  console.log('   • charlie@example.com (Charlie Brown)');
  console.log('   • diana@example.com (Diana Prince)');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
