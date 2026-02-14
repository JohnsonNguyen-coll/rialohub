import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
      try {
            const { username, password } = await req.json();

            if (!username || !password) {
                  return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
            }

            // Validate username format: no spaces, no special chars except underscore
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                  return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
            }

            if (username.length < 3) {
                  return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                  where: { username }
            });

            if (existingUser) {
                  return NextResponse.json({ error: "Username already taken" }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await (prisma.user as any).create({
                  data: {
                        username,
                        name: username, // Set display name equal to username
                        password: hashedPassword,
                        role: 'user'
                  }
            });

            return NextResponse.json({
                  message: "User created successfully",
                  user: {
                        id: user.id,
                        username: user.username
                  }
            });

      } catch (error: any) {
            console.error("Registration error:", error);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
}
