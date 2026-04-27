import { PrismaClient } from '../db/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL
        })
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
