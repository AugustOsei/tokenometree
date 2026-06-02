import { createClient } from '@supabase/supabase-js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }
  return createClient(url, key);
}

function generateReferralCode() {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += REF_CODE_CHARS[Math.floor(Math.random() * REF_CODE_CHARS.length)];
  }
  return code;
}

async function uniqueReferralCode(supabase) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode();
    const { data } = await supabase
      .from('waitlist')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate referral code');
}

async function sendConfirmationEmail({ email, position, referralCode }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping email');
    return;
  }

  const shareUrl = `https://tokenometree.com?ref=${referralCode}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <tr>
      <td style="padding-bottom:24px;">
        <span style="font-size:28px;font-weight:800;color:#4ade80;letter-spacing:-0.02em;">Tokenometree</span>
      </td>
    </tr>
    <tr>
      <td style="font-size:18px;line-height:1.5;color:#fafafa;padding-bottom:16px;">
        You're <strong style="color:#FFD055;">#${position}</strong> in line.
      </td>
    </tr>
    <tr>
      <td style="font-size:15px;line-height:1.6;color:#a3a3a3;padding-bottom:24px;">
        Know every token. We'll reach out the moment Tokenometree launches.
      </td>
    </tr>
    <tr>
      <td style="background:#141414;border:2px solid #166534;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#4ade80;text-transform:uppercase;letter-spacing:0.05em;">Move up the list</p>
        <p style="margin:0 0 12px;font-size:14px;color:#d4d4d4;">Share your link — every referral moves you up one spot.</p>
        <a href="${shareUrl}" style="color:#4ade80;font-size:15px;word-break:break-all;">${shareUrl}</a>
      </td>
    </tr>
    <tr>
      <td style="font-size:14px;color:#737373;padding-top:8px;">
        — The Tokenometree team
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tokenometree <hello@augustwheel.com>',
      to: email,
      subject: "You're on the Tokenometree waitlist 🌳",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
  }
}

async function bumpReferrer(supabase, refCode) {
  if (!refCode) return;

  const { data: referrer } = await supabase
    .from('waitlist')
    .select('id, position')
    .eq('referral_code', refCode)
    .maybeSingle();

  if (!referrer) return;

  const newPosition = Math.max(1, referrer.position - 1);
  await supabase
    .from('waitlist')
    .update({ position: newPosition })
    .eq('id', referrer.id);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const supabase = getSupabase();

    if (req.method === 'GET' && req.query?.count === '1') {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return res.status(200).json({ count: count ?? 0 });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = (body?.email || '').trim().toLowerCase();
    const ref = (body?.ref || '').trim().toUpperCase() || null;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const { data: existing } = await supabase
      .from('waitlist')
      .select('position, referral_code')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        error: 'This email is already on the waitlist.',
        position: existing.position,
        referral_code: existing.referral_code,
      });
    }

    const { count: totalCount, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const position = (totalCount ?? 0) + 1;
    const referral_code = await uniqueReferralCode(supabase);

    let referred_by = null;
    if (ref) {
      const { data: referrer } = await supabase
        .from('waitlist')
        .select('referral_code')
        .eq('referral_code', ref)
        .maybeSingle();
      if (referrer) referred_by = ref;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email,
        referral_code,
        referred_by,
        position,
      })
      .select('position, referral_code')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'This email is already on the waitlist.' });
      }
      throw insertError;
    }

    if (referred_by) {
      await bumpReferrer(supabase, referred_by);
    }

    await sendConfirmationEmail({
      email,
      position: inserted.position,
      referralCode: inserted.referral_code,
    });

    return res.status(200).json({
      position: inserted.position,
      referral_code: inserted.referral_code,
    });
  } catch (err) {
    console.error('Waitlist error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
