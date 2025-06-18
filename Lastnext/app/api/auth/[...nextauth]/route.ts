// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/app/lib/db';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.sub) {
        try {
          const api = await connectToDatabase();
          
          // Check if user exists
          const response = await api.get(`/users/me/`);
          const existingUser = response.data;
          
          if (!existingUser) {
            // Create new user
            await api.post('/users/', {
              email: user.email,
              name: user.name,
              image: user.image,
              google_id: profile.sub
            });
          } else {
            // Update existing user
            await api.patch(`/users/${existingUser.id}/`, {
              name: user.name,
              image: user.image,
              google_id: profile.sub
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };