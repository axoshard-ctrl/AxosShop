import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function LiveChat() {
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "agent" }>>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Auto-respond after 1s
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Thanks for your message! An agent will respond shortly.", sender: "agent" },
        ]);
      }, 1000);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 p-0 gap-2 shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 shadow-2xl rounded-lg overflow-hidden">
      <Card className="border-0">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat Support
              </CardTitle>
              <CardDescription className="text-white/80 text-xs mt-1">
                Usually responds in 2 minutes
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Messages */}
          <div className="h-64 overflow-y-auto space-y-3 bg-muted/30 p-3 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                Hi! 👋 How can we help you today?
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} size="sm" className="gap-2">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Available 24/7
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
