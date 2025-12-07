import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// Credentials (Using same as outbreak)
const SMS_API_URL = "https://api.sms-gate.app/3rdparty/v1/message";
const SMS_DEVICE_ID = "p11qNhTGuag7XsNKbQDU-"; 
const SMS_USERNAME = "LRNKN8";                   
const SMS_PASSWORD = "ie0d45rgxshpfs";           

export async function POST(request: Request) {
  try {
    const { schemeName, benefit, link } = await request.json();

    if (!schemeName) {
      return NextResponse.json({ error: 'Missing scheme name' }, { status: 400 });
    }

    console.log(`📜 New Scheme Alert: ${schemeName}`);

    // 1. Fetch ALL users with valid phones
    const { data: users, error } = await supabase
      .from('profiles')
      .select('phone, fullname')
      .not('phone', 'is', null);

    if (error || !users || users.length === 0) {
      return NextResponse.json({ message: 'No users found to notify' });
    }

    console.log(`Found ${users.length} users. Sending SMS...`);

    // 2. Prepare Message (Short & Clean)
    const messageText = `📢 NEW GOVT SCHEME: ${schemeName}. \nBenefits: ${benefit}. \nApply here: ${link} \n- FarmSeva`;

    // 3. Send SMS Loop
    const results = await Promise.all(users.map(async (user) => {
      // Basic check for phone length
      if (user.phone && user.phone.length < 10) return { user: user.fullname, status: 'invalid_phone' };

      try {
        const authHeader = 'Basic ' + Buffer.from(SMS_USERNAME + ':' + SMS_PASSWORD).toString('base64');

        await fetch(SMS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            deviceId: SMS_DEVICE_ID,
            phoneNumbers: [user.phone],
            message: messageText
          })
        });
        
        return { user: user.fullname, status: 'sent' };
      } catch (e: any) {
        console.error(`Failed to text ${user.fullname}`);
        return { user: user.fullname, status: 'failed' };
      }
    }));

    return NextResponse.json({ success: true, count: results.length });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}