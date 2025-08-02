"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", form);
      if (res.data.success && res.data.token) {
        // The login function from context now handles storing user data
        debugger;
        login(res.data.user, res.data.token);
        router.push("/dashboard");
      } else {
        setMessage(res.data.error || "Login failed.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Login with Google
            </Button>
          </form>
          {message && <div className="mt-4 text-center text-sm text-red-600">{message}</div>}
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
