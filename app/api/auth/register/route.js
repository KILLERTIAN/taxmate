import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// This is a mock database. In a real application, you would use a proper database.
const users = [];

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    // Add user to mock database
    users.push(user);

    // Return success response without sensitive data
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 