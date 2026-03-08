import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify calling user is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("auth_id", callingUser.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Handle deactivate action
    if (body.action === "deactivate" && body.target_auth_id) {
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        body.target_auth_id,
        { ban_duration: "876600h" } // ~100 years
      );

      if (banError) {
        return new Response(JSON.stringify({ error: banError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle create user action
    const { email, password, name, role, department, section, faculty_id, expertise, max_students } = body;

    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["faculty", "coordinator"].includes(role)) {
      return new Response(JSON.stringify({ error: "Can only create faculty or coordinator accounts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into users table
    const { data: newUser, error: insertError } = await supabaseAdmin.from("users").insert({
      auth_id: newAuthUser.user.id,
      email,
      name,
      role,
      department: department || null,
      section: section || null,
      faculty_id: faculty_id || null,
      expertise: expertise || null,
      max_students: max_students || 5,
    }).select("id").single();

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If coordinator, insert into coordinator_sections
    if (role === "coordinator" && department && section && newUser) {
      const { error: sectionError } = await supabaseAdmin.from("coordinator_sections").insert({
        coordinator_id: newUser.id,
        department,
        section,
      });

      if (sectionError) {
        console.error("Failed to insert coordinator section:", sectionError.message);
      }
    }

    return new Response(JSON.stringify({ success: true, user_id: newAuthUser.user.id }), {
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
