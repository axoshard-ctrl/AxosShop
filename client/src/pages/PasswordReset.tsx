import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from '@/lib/languageContext';
import { apiRequest } from "@/lib/queryClient";
import { Lock, Mail, CheckCircle } from "lucide-react";

type Step = "request" | "confirm" | "success";

export default function PasswordReset() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t('common.error', language),
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/password-reset-request", { email });
      toast({
        title: t('common.success', language),
        description: "Check your email for password reset instructions",
      });
      setStep("confirm");
    } catch (error: any) {
      toast({
        title: t('common.error', language),
        description: error.message || "Failed to request password reset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) {
      toast({
        title: t('common.error', language),
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error', language),
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('common.error', language),
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/password-reset-confirm", {
        email,
        token,
        newPassword,
      });
      toast({
        title: t('common.success', language),
        description: "Password reset successfully!",
      });
      setStep("success");
      setTimeout(() => setLocation("/login"), 2000);
    } catch (error: any) {
      toast({
        title: t('common.error', language),
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
            {step === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Lock className="h-6 w-6 text-purple-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === "request" && "Reset Password"}
            {step === "confirm" && "Enter Reset Code"}
            {step === "success" && "Password Reset"}
          </h1>
        </div>

        {step === "request" && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email address and we'll send you a password reset link.
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">{t('auth.email', language)}</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.loading', language) : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/login")}
            >
              Back to Login
            </Button>
          </form>
        )}

        {step === "confirm" && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Enter the reset code from your email and your new password.
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">Reset Code</label>
              <Input
                type="text"
                placeholder="Enter the code from your email"
                className="mt-2"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="mt-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                className="mt-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('common.loading', language) : "Reset Password"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("request")}
            >
              Back
            </Button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                Your password has been reset successfully. You will be redirected to login shortly.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => setLocation("/login")}
            >
              Go to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
