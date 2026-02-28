import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, role, orgId } = await req.json()

        if (!email || !role || !orgId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Initialize Supabase admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: { persistSession: false },
            }
        )

        // 1. Try to invite the user
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
        let userId = inviteData?.user?.id

        if (inviteError || !userId) {
            // If the user already exists, invite may fail or return no ID. Let's try to find their ID.
            const { data: searchData, error: searchError } = await supabaseAdmin.auth.admin.listUsers()
            if (searchData?.users) {
                const foundUser = searchData.users.find(u => u.email === email)
                if (foundUser) {
                    userId = foundUser.id
                }
            }
        }

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Failed to create or find user.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        // 2. Add user to the organization_members table
        const { error: insertError } = await supabaseAdmin
            .from('organization_members')
            .insert({
                organization_id: orgId,
                user_id: userId,
                role: role,
            })

        if (insertError) {
            // 23505 is unique violation, ignore if they are already in the org
            if (insertError.code !== '23505') {
                return new Response(JSON.stringify({ error: insertError.message }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                })
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
