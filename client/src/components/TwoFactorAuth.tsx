import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Lock, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface TwoFactorAuthProps {
  userId: string;
  email: string;
}

export function TwoFactorAuth({ userId, email }: TwoFactorAuthProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<"sms" | "authenticator" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const enableSMS = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/2fa/sms/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!response.ok) throw new Error("Failed to enable SMS 2FA");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "SMS 2FA enabled", description: "Check your phone for verification code" });
      setMethod("sms");
    },
  });

  const enableAuthenticator = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/2fa/authenticator/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      });
      if (!response.ok) throw new Error("Failed to enable authenticator");
      const data = await response.json();
      setSecret(data.secret);
      return data;
    },
    onSuccess: () => {
      setMethod("authenticator");
      toast({ title: "Setup authenticator app", description: "Scan QR code with your authenticator" });
    },
  });

  const verify2FA = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/auth/2fa/${method}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, userId }),
      });
      if (!response.ok) throw new Error("Invalid verification code");
      return response.json();
    },
    onSuccess: () => {
      setIsEnabled(true);
      setMethod(null);
      setVerificationCode("");
      toast({ title: "Success", description: "Two-factor authentication enabled!" });
    },
  });

  const disable2FA = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to disable 2FA");
      return response.json();
    },
    onSuccess: () => {
      setIsEnabled(false);
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">2FA Status</span>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          {!isEnabled ? (
            <>
              {/* Method Selection */}
              {!method && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Choose a verification method:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setMethod("sms")}
                      className="gap-2 h-auto flex-col"
                    >
                      <Smartphone className="w-5 h-5" />
                      SMS Text
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => enableAuthenticator.mutate()}
                      className="gap-2 h-auto flex-col"
                    >
                      <Lock className="w-5 h-5" />
                      Authenticator App
                    </Button>
                  </div>
                </div>
              )}

              {/* SMS Setup */}
              {method === "sms" && (
                <div className="space-y-4">
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Button
                    onClick={() => enableSMS.mutate()}
                    disabled={enableSMS.isPending || !phoneNumber}
                    className="w-full"
                  >
                    Send Verification Code
                  </Button>
                </div>
              )}

              {/* Authenticator Setup */}
              {method === "authenticator" && secret && (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-muted rounded-lg">
                    <QRCodeSVG value={`otpauth://totp/AxosShop:${email}?secret=${secret}`} size={200} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Can't scan?</p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-sm font-mono flex-1">{secret}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Code */}
              {method && (
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength="6"
                  />
                  <Button
                    onClick={() => verify2FA.mutate()}
                    disabled={verify2FA.isPending || verificationCode.length !== 6}
                    className="w-full"
                  >
                    Verify & Enable 2FA
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMethod(null);
                      setVerificationCode("");
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button
              variant="destructive"
              onClick={() => disable2FA.mutate()}
              disabled={disable2FA.isPending}
              className="w-full"
            >
              Disable Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
