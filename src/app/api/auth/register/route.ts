import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: username,
        role: "STUDENT",
      },
    })

    return NextResponse.json({ message: "Account created", userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
