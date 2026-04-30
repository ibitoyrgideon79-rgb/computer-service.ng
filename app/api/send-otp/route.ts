import { NextRequest, NextResponse } from "next/server";
import otpStore from "@/lib/otpStore";

// Termii API credentials
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "IDCODE";

export async function POST(request: NextRequest) {
  try {
    let { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Normalize phone number to international format for Termii
    // Remove any non-numeric characters
    phoneNumber = phoneNumber.replace(/\D/g, "");
    
    // If it starts with 0 (Nigerian local format), replace with 234 (country code)
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "234" + phoneNumber.slice(1);
    }
    
    // If it doesn't have a country code, add 234 for Nigeria
    if (!phoneNumber.startsWith("234") && !phoneNumber.startsWith("+")) {
      phoneNumber = "234" + phoneNumber;
    }
    
    // Add + sign if not present
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+" + phoneNumber;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10-minute expiration
    otpStore.set(phoneNumber, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP via Termii API
    if (TERMII_API_KEY) {
      try {
        const termiiPayload = {
          to: phoneNumber,
          from: TERMII_SENDER_ID,
          sms: `Your Computer Service verification code is: ${otp}. Valid for 10 minutes.`,
          type: "plain",
          channel: "generic",
          api_key: TERMII_API_KEY,
        };

        console.log("Sending to Termii:", termiiPayload);

        const response = await fetch("https://api.ng.termii.com/api/sms/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(termiiPayload),
        });

        const responseData = await response.json();
        console.log("Termii response:", responseData, "Status:", response.status);

        if (!response.ok) {
          console.error("Termii API error:", responseData);
          // Handle error message that might be array or string
          let errorMessage = "Failed to send OTP. Please try again.";
          if (responseData?.message) {
            if (Array.isArray(responseData.message)) {
              errorMessage = responseData.message[0]?.issue || errorMessage;
            } else if (typeof responseData.message === "string") {
              errorMessage = responseData.message;
            }
          }
          return NextResponse.json(
            { message: errorMessage, details: responseData },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Termii send error:", error);
        return NextResponse.json(
          { message: "Failed to send OTP. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // For development without API key
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
    }

    return NextResponse.json(
      {
        message: "OTP sent successfully",
        ...(process.env.NODE_ENV === "development" && { debug: otp }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
