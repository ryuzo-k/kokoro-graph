"use client";
import { supabase } from "@/lib/supabase";
export default function Login() {
  async function handle(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    await supabase.auth.signInWithOtp({ email });
    alert("Check your mailbox for the magic link!");
  }
  return (
    <form onSubmit={handle} className="flex flex-col gap-4 max-w-xs mx-auto mt-24">
      <h1 className="text-2xl font-bold">Log in</h1>
      <input name="email" type="email" placeholder="you@example.com" className="input" required />
      <button className="btn">Send Magic Link</button>
    </form>
  );
}
