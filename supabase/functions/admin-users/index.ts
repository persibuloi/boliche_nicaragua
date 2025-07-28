import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { action, userData, userId, currentPassword, newPassword } = await req.json()
    
    // Verify admin token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify token and get current user
    const { data: tokenData, error: tokenError } = await supabase
      .from('admin_tokens')
      .select('user_id, admin_users(id, email, name, role)')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentUser = tokenData.admin_users

    switch (action) {
      case 'list':
        const { data: users, error: listError } = await supabase
          .from('admin_users')
          .select('id, email, name, role, is_active, created_at, last_login')
          .order('created_at', { ascending: false })

        if (listError) throw listError

        return new Response(
          JSON.stringify({ data: users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create':
        // Only admins can create users
        if (currentUser.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Hash password
        const encoder = new TextEncoder()
        const data = encoder.encode(userData.password)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        const { data: newUser, error: createError } = await supabase
          .from('admin_users')
          .insert([{
            name: userData.name,
            email: userData.email,
            password_hash: hashedPassword,
            role: userData.role,
            is_active: true,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify({ data: newUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'change-password':
        // Hash current password to verify
        const currentEncoder = new TextEncoder()
        const currentData = currentEncoder.encode(currentPassword)
        const currentHashBuffer = await crypto.subtle.digest('SHA-256', currentData)
        const currentHashArray = Array.from(new Uint8Array(currentHashBuffer))
        const currentHashedPassword = currentHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        // Verify current password
        const { data: userCheck, error: checkError } = await supabase
          .from('admin_users')
          .select('password_hash')
          .eq('id', currentUser.id)
          .single()

        if (checkError || userCheck.password_hash !== currentHashedPassword) {
          return new Response(
            JSON.stringify({ error: 'Current password is incorrect' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Hash new password
        const newEncoder = new TextEncoder()
        const newData = newEncoder.encode(newPassword)
        const newHashBuffer = await crypto.subtle.digest('SHA-256', newData)
        const newHashArray = Array.from(new Uint8Array(newHashBuffer))
        const newHashedPassword = newHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ 
            password_hash: newHashedPassword,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id)

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ data: { success: true } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'toggle-status':
        // Only admins can toggle user status
        if (currentUser.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get current status
        const { data: userStatus, error: statusError } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('id', userId)
          .single()

        if (statusError) throw statusError

        // Toggle status
        const { error: toggleError } = await supabase
          .from('admin_users')
          .update({ 
            is_active: !userStatus.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (toggleError) throw toggleError

        return new Response(
          JSON.stringify({ data: { success: true } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete':
        // Only admins can delete users
        if (currentUser.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Can't delete yourself
        if (userId === currentUser.id) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete your own account' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ data: { success: true } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Admin users function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
