import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

import { isAdminEmail } from "@/lib/admin-access";
import { prisma } from "@/lib/db";
import { syncSocialPersonas } from "@/lib/persona";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 365,
  },
  providers: [
    Credentials({
      name: "이메일",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nickname ?? user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID,
      clientSecret: process.env.AUTH_KAKAO_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        url: "https://kauth.kakao.com/oauth/authorize",
        params: {
          scope: "account_email gender age_range",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;

      if (token.sub) {
        const profile = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            name: true,
            email: true,
            nickname: true,
            role: true,
            image: true,
            _count: {
              select: {
                personas: { where: { status: "VERIFIED" } },
              },
            },
          },
        });

        if (profile) {
          token.name = profile.nickname ?? profile.name;
          token.email = profile.email;
          token.picture = profile.image;
          token.isAdmin = isAdminEmail(profile.email);
          token.verifiedPersonaCount = profile._count.personas;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.verifiedPersonaCount =
          typeof token.verifiedPersonaCount === "number"
            ? token.verifiedPersonaCount
            : 0;
        session.user.isAdmin = token.isAdmin === true;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (!user.id) return;

      if (isAdminEmail(user.email)) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        } catch (error) {
          console.error("[auth] admin role sync failed", error);
        }
      }

      if (!account || account.provider === "credentials") return;

      try {
        await syncSocialPersonas({
          userId: user.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          profile,
        });
      } catch (error) {
        console.error("[auth] social persona sync failed", error);
      }
    },
  },
});
