import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { signupSchema } from "@shared/schema";
import { Lock, Mail, User as UserIcon, Shield } from "lucide-react";
import { z } from "zod";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      await signup(data.email, data.password, data.name);
      toast({
        title: "Account created!",
        description: "Welcome to Axo Shard Store.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/">
        <div className="flex items-center gap-3 mb-8 hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer" data-testid="link-home">
          <img src={heroImage} alt="Axo Shard" className="h-12 w-12 rounded-md" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Axo Shard Store</h1>
          </div>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start shopping for exclusive axolotl merch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          data-testid="input-name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          onChange={(e) => {
                            field.onChange(e);
                            checkPasswordStrength(e.target.value);
                          }}
                          data-testid="input-password"
                        />
                      </div>
                    </FormControl>
                    {passwordStrength && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 flex gap-1">
                          <div className={`h-1 flex-1 rounded ${passwordStrength === "weak" ? "bg-destructive" : passwordStrength === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                          <div className={`h-1 flex-1 rounded ${passwordStrength === "medium" || passwordStrength === "strong" ? "bg-yellow-500" : "bg-muted"}`} />
                          <div className={`h-1 flex-1 rounded ${passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                        </div>
                        <span className={`text-xs ${passwordStrength === "weak" ? "text-destructive" : passwordStrength === "medium" ? "text-yellow-600" : "text-green-600"}`}>
                          {passwordStrength}
                        </span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          data-testid="input-confirm-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                Sign in
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your data is encrypted and secure</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
