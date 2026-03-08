import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create users
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'John Student',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      name: 'Jane Instructor',
      email: 'instructor@example.com',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    },
  })

  console.log('✅ Users created')

  // Create courses
  const javaCourse = await prisma.course.create({
    data: {
      title: 'Complete Java Programming',
      description: 'Master Java from basics to advanced concepts. This comprehensive course covers everything you need to know about Java programming.',
      thumbnail: 'https://img.youtube.com/vi/RRubcjpTkks/maxresdefault.jpg',
      instructorName: 'John Doe',
      category: 'java',
      totalLessons: 5,
      totalDuration: '1 hour 15 minutes',
      whatYouWillLearn: 'Java fundamentals and syntax\nObject-oriented programming concepts\nData structures and algorithms\nException handling\nFile I/O operations\nMultithreading and concurrency',
      sections: {
        create: [
          {
            title: 'Introduction to Java',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'What is Java?',
                  youtubeUrl: 'RRubcjpTkks',
                  duration: '10:00',
                  order: 1,
                },
                {
                  title: 'Setting up Environment',
                  youtubeUrl: '_uQrJ0TkZlc',
                  duration: '15:00',
                  order: 2,
                },
                {
                  title: 'Your First Java Program',
                  youtubeUrl: 'GwIo9gDZCVQ',
                  duration: '12:00',
                  order: 3,
                },
              ],
            },
          },
          {
            title: 'Java Basics',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'Variables and Data Types',
                  youtubeUrl: 'H1e7fIRutxk',
                  duration: '18:00',
                  order: 1,
                },
                {
                  title: 'Operators',
                  youtubeUrl: 'RRubcjpTkks',
                  duration: '20:00',
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  const pythonCourse = await prisma.course.create({
    data: {
      title: 'Python for Beginners',
      description: 'Learn Python programming from scratch with hands-on examples and projects.',
      thumbnail: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg',
      instructorName: 'Jane Smith',
      category: 'python',
      totalLessons: 3,
      totalDuration: '45 minutes',
      whatYouWillLearn: 'Python basics and syntax\nControl flow and functions\nWorking with data structures\nFile handling\nError handling',
      sections: {
        create: [
          {
            title: 'Getting Started with Python',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Introduction to Python',
                  youtubeUrl: '_uQrJ0TkZlc',
                  duration: '15:00',
                  order: 1,
                },
                {
                  title: 'Python Variables and Types',
                  youtubeUrl: 'GwIo9gDZCVQ',
                  duration: '15:00',
                  order: 2,
                },
                {
                  title: 'Basic Operations',
                  youtubeUrl: 'H1e7fIRutxk',
                  duration: '15:00',
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  const mlCourse = await prisma.course.create({
    data: {
      title: 'Machine Learning A-Z',
      description: 'Complete ML course with hands-on projects covering supervised and unsupervised learning.',
      thumbnail: 'https://img.youtube.com/vi/GwIo9gDZCVQ/maxresdefault.jpg',
      instructorName: 'Dr. Mike Wilson',
      category: 'ML',
      totalLessons: 3,
      totalDuration: '1 hour',
      whatYouWillLearn: 'Machine Learning fundamentals\nSupervised learning algorithms\nUnsupervised learning\nNeural networks basics\nModel evaluation',
      sections: {
        create: [
          {
            title: 'Introduction to Machine Learning',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'What is Machine Learning?',
                  youtubeUrl: 'q66XvRzh9nI',
                  duration: '20:00',
                  order: 1,
                },
                {
                  title: 'Types of Machine Learning',
                  youtubeUrl: '1VS_7S9qMCY',
                  duration: '20:00',
                  order: 2,
                },
                {
                  title: 'ML Algorithms Overview',
                  youtubeUrl: 'iVaq1_K46V8',
                  duration: '20:00',
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Courses created')

  // Create enrollment for student in Java course
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: javaCourse.id,
      status: 'active',
    },
  })

  console.log('✅ Enrollments created')

  console.log('🎉 Seeding completed successfully!')
  console.log('\nDemo credentials:')
  console.log('Student: student@example.com / password123')
  console.log('Instructor: instructor@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
