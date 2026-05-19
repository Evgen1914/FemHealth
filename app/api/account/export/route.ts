import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const userId = user.id;

  const [
    profile,
    patientProfile,
    doctorProfile,
    cycleEntries,
    symptoms,
    labResults,
    labValues,
    weightLog,
    doctorComments,
    patientLinks,
    consents,
    subscription,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('patient_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('doctor_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('cycle_entries').select('*').eq('patient_id', userId).order('date', { ascending: false }),
    supabase.from('symptoms').select('*').eq('patient_id', userId).order('created_at', { ascending: false }),
    supabase.from('lab_results').select('*').eq('patient_id', userId).order('taken_at', { ascending: false }),
    supabase
      .from('lab_values')
      .select('*')
      .in(
        'lab_result_id',
        (
          await supabase.from('lab_results').select('id').eq('patient_id', userId)
        ).data?.map((r) => r.id) ?? [],
      ),
    supabase.from('weight_log').select('*').eq('patient_id', userId).order('date', { ascending: false }),
    supabase.from('doctor_comments').select('*').eq('patient_id', userId).order('created_at', { ascending: false }),
    supabase.from('patient_links').select('*').or(`patient_id.eq.${userId},doctor_id.eq.${userId}`),
    supabase.from('consents').select('*').eq('user_id', userId),
    supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: userId,
      email: user.email,
    },
    profile: profile.data,
    patient_profile: patientProfile.data,
    doctor_profile: doctorProfile.data,
    cycle_entries: cycleEntries.data ?? [],
    symptoms: symptoms.data ?? [],
    lab_results: labResults.data ?? [],
    lab_values: labValues.data ?? [],
    weight_log: weightLog.data ?? [],
    doctor_comments: doctorComments.data ?? [],
    patient_links: patientLinks.data ?? [],
    consents: consents.data ?? [],
    subscription: subscription.data,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="femhealth-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
