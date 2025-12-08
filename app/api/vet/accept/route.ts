import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin (Bypasses RLS to fetch user phone numbers)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// SMS Gateway Config
const SMS_API_URL = "https://api.sms-gate.app/3rdparty/v1/message";
const SMS_DEVICE_ID = "p11qNhTGuag7XsNKbQDU-"; 
const SMS_USERNAME = "LRNKN8";                   
const SMS_PASSWORD = "ie0d45rgxshpfs";           

export async function POST(request: Request) {
  try {
    const { requestId, vetName, vetId } = await request.json();

    if (!requestId || !vetName) {
      return NextResponse.json({ error: 'Missing Request ID or Vet Name' }, { status: 400 });
    }

    console.log(`👨‍⚕️ Vet ${vetName} is accepting request ${requestId}`);

    // 1. Update the Request in Supabase
    const { data: updatedRequest, error: updateError } = await supabase
      .from('vet_requests')
      .update({ 
        status: 'accepted',
        vet_id: vetId, 
        // updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError || !updatedRequest) {
      throw new Error("Failed to update request status: " + updateError?.message);
    }

    // 2. Get the Farmer's Profile (to find their phone number)
    const farmerId = updatedRequest.farmer_id;
    
    const { data: farmerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('phone, fullname')
      .eq('id', farmerId)
      .single();

    if (profileError || !farmerProfile?.phone) {
      console.warn("Farmer has no phone number. Status updated, but no SMS sent.");
      return NextResponse.json({ success: true, message: "Request accepted (No SMS sent - Phone missing)" });
    }

    // 3. Send the SMS
    const messageText = `✅ VET UPDATE: Dr. ${vetName} has accepted your request for ${updatedRequest.farm_name}. They will contact you shortly. - FarmSeva`;

    const authHeader = 'Basic ' + Buffer.from(SMS_USERNAME + ':' + SMS_PASSWORD).toString('base64');

    const smsResponse = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        deviceId: SMS_DEVICE_ID,
        phoneNumbers: [farmerProfile.phone],
        message: messageText
      })
    });

    if (!smsResponse.ok) {
      console.error("SMS Gateway Error:", await smsResponse.text());
    } else {
      console.log("SMS sent successfully to", farmerProfile.phone);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Accept API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}