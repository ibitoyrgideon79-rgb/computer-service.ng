import { NextRequest, NextResponse } from "next/server";
import otpStore from "@/lib/otpStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const otp = body.otp as string;
    let phoneNumber = body.phoneNumber as string;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Normalize phone number to international format (same as send-otp)
    phoneNumber = phoneNumber.replace(/\D/g, "");
    
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "234" + phoneNumber.slice(1);
    }
    
    if (!phoneNumber.startsWith("234") && !phoneNumber.startsWith("+")) {
      phoneNumber = "234" + phoneNumber;
    }
    
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    const storedOtp = otpStore.get(phoneNumber);

    if (!storedOtp) {
      return NextResponse.json(
        { message: "No OTP found for this phone number. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(phoneNumber);
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOtp.code !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP is valid, delete it
    otpStore.delete(phoneNumber);

    // TODO: Fetch user's saved projects from database
    return NextResponse.json(
      {
        message: "OTP verified successfully",
        phoneNumber,
        // projects: [] // Return user's saved projects here
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
