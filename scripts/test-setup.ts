import prisma from '../src/services/database/client'

async function test() {
  const users = await prisma.user.findMany()
  console.log('DB connected. Users:', users)
}

test()
