import { PrismaClient } from '@prisma/client';

// Per https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
const prisma = global.prisma || new PrismaClient(process.env?.DEBUG > 1 ? { log: ['query'] } : {});

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
