import NextAuth from 'next-auth';
import TwitchProvider from 'next-auth/providers/twitch';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '../../../lib/prisma';

export default NextAuth({
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
    }),
  ],
  database: process.env.DATABASE_URL,
  adapter: PrismaAdapter(prisma),

  secret: process.env.SECRET,

  callbacks: {
    signIn: async ({ user }) => {
      if (!user.isAdmin && !process.env.ALLOW_NEW_SIGNUPS) return '/';

      return true;
    },
    session: async ({ session, user }) => {
      session.user.isAdmin = user.isAdmin;

      return session;
    },
  },

  debug: false,
});
