import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface EmailServiceConfig {
  provider: "sendgrid" | "mailgun" | "aws-ses" | "smtp" | null;
  apiKey?: string;
  apiSecret?: string;
  fromEmail: string;
  isConfigured: boolean;
}

export function EmailServiceConfig() {
  const [config, setConfig] = useState<EmailServiceConfig>({
    provider: null,
    fromEmail: "noreply@axosshop.com",
    isConfigured: false,
  });

  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: testEmail, config }),
      });
      if (response.ok) {
        alert("Test email sent successfully!");
      } else {
        alert("Failed to send test email");
      }
    } catch (error) {
      alert("Error: " + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.isConfigured ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Email Service Active
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Email Service Not Configured
              </>
            )}
          </CardTitle>
          <CardDescription>
            {config.isConfigured
              ? `Using ${config.provider}`
              : "No email provider configured - emails will be logged to console"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Email Provider</CardTitle>
          <CardDescription>
            Choose your email service provider and add credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Provider</label>
            <Select
              value={config.provider || ""}
              onValueChange={(value) =>
                setConfig({ ...config, provider: value as EmailServiceConfig["provider"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="aws-ses">AWS SES</SelectItem>
                <SelectItem value="smtp">Custom SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider Instructions */}
          {config.provider && (
            <div className="bg-muted p-4 rounded-lg space-y-3">
              {config.provider === "sendgrid" && (
                <>
                  <p className="font-semibold text-foreground">SendGrid Setup</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Create account at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sendgrid.com</a></li>
                    <li>Go to Settings → API Keys</li>
                    <li>Create a new API key (Full Access)</li>
                    <li>Paste the key below</li>
                  </ol>
                </>
              )}
              {config.provider === "mailgun" && (
                <>
                  <p className="font-semibold text-foreground">Mailgun Setup</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Create account at <a href="https://mailgun.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mailgun.com</a></li>
                    <li>Go to Sending → API</li>
                    <li>Copy your API Key and Domain</li>
                    <li>Paste below</li>
                  </ol>
                </>
              )}
              {config.provider === "aws-ses" && (
                <>
                  <p className="font-semibold text-foreground">AWS SES Setup</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Go to AWS SES console</li>
                    <li>Create SMTP credentials</li>
                    <li>Verify your sending domain</li>
                    <li>Add credentials below</li>
                  </ol>
                </>
              )}
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={config.apiKey || ""}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>

          {/* From Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Email Address</label>
            <Input
              type="email"
              placeholder="noreply@axosshop.com"
              value={config.fromEmail}
              onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
            />
          </div>

          {/* Save Button */}
          <Button
            className="w-full"
            disabled={!config.provider || !config.apiKey}
          >
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Service</CardTitle>
          <CardDescription>
            Send a test email to verify your configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="your.email@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <Button
            onClick={handleTest}
            disabled={!testEmail || !config.provider || isTesting}
            className="w-full"
          >
            {isTesting ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Available email templates for your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Order Confirmation", status: "ready" },
              { name: "Order Status Update", status: "ready" },
              { name: "Restock Notification", status: "ready" },
              { name: "Price Drop Alert", status: "ready" },
              { name: "Abandoned Cart", status: "ready" },
              { name: "Newsletter", status: "ready" },
            ].map((template) => (
              <div
                key={template.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium text-foreground">{template.name}</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Ready
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
