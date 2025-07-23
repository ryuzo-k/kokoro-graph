import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const getUser = async () => {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON!
    );
    
    // Get auth token from cookies
    const authToken = cookieStore.get('sb-access-token')?.value;
    if (!authToken) {
      return null;
    }
    
    const { data } = await supabase.auth.getUser(authToken);
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
