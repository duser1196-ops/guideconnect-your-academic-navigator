import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const users = [
      { email: "student@mvsrec.edu.in", password: "123456", name: "Test Student", role: "student", department: "CSE", section: "A", registration_number: "21B01A0501" },
      { email: "faculty@test.com", password: "123456", name: "Test Faculty", role: "faculty", department: "CSE", expertise: ["Machine Learning", "AI", "Web Development"], max_students: 5 },
      { email: "coordinator@test.com", password: "123456", name: "Test Coordinator", role: "coordinator", department: "CSE", section: "A" },
      { email: "admin@test.com", password: "123456", name: "Test Admin", role: "admin", department: "CSE" },
    ];

    const results = [];

    for (const u of users) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      });

      if (authError) {
        results.push({ email: u.email, error: authError.message });
        continue;
      }

      // Insert profile
      const { data: profile, error: profileError } = await supabaseAdmin.from("users").insert({
        auth_id: authUser.user.id,
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department || null,
        section: u.section || null,
        registration_number: (u as any).registration_number || null,
        expertise: (u as any).expertise || null,
        max_students: (u as any).max_students || 5,
      }).select("id").single();

      if (profileError) {
        results.push({ email: u.email, error: profileError.message });
        continue;
      }

      // If coordinator, add section
      if (u.role === "coordinator" && u.department && u.section && profile) {
        await supabaseAdmin.from("coordinator_sections").insert({
          coordinator_id: profile.id,
          department: u.department,
          section: u.section,
        });
      }

      results.push({ email: u.email, success: true, role: u.role });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});