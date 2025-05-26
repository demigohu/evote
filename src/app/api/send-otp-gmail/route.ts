import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { supabase } from '../../../lib/supabase';
import { keccak256, toHex } from 'viem';

dotenv.config();

// Konfigurasi transporter untuk Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email, otp, votingId } = await request.json();

    // Validasi input
    if (!email || !otp || !votingId) {
      return NextResponse.json({ error: 'Email, OTP, dan votingId diperlukan' }, { status: 400 });
    }

    // Periksa apakah email sudah digunakan di voting round ini
    const emailHash = keccak256(toHex(email));
    const { data, error } = await supabase
      .from('used_emails')
      .select('email_hash')
      .eq('email_hash', emailHash)
      .eq('voting_id', votingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error checking email usage:', error);
      return NextResponse.json({ error: 'Gagal memeriksa penggunaan email' }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ error: 'Email ini sudah digunakan di voting round ini' }, { status: 400 });
    }

    // Kirim email dengan OTP
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
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