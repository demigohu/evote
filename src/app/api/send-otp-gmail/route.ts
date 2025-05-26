import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Konfigurasi transporter untuk Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Ganti dengan alamat Gmail kamu
    pass: process.env.GMAIL_PASS, // Ganti dengan App Password Gmail kamu
  },
});

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    // Kirim email dengan OTP
    await transporter.sendMail({
      from: process.env.GMAIL_USER, // Ganti dengan alamat Gmail kamu
      to: email,
      subject: 'Kode OTP untuk Verifikasi Email',
      html: `<p>Kode OTP Anda adalah: <strong>${otp}</strong></p><p>Kode ini akan kadaluarsa dalam 5 menit.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Gagal mengirim OTP' }, { status: 500 });
  }
}