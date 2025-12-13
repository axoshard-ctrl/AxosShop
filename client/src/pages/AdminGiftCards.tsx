import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Trash2, Plus, Copy } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  used: boolean;
  createdAt: string;
}

export default function AdminGiftCards() {
  const { language } = useLanguage();
  const isDarkMode = false; // or get from context if available
  const [giftCards, setGiftCards] = useState<GiftCard[]>([
    { id: "1", code: "GIFT-ABC123", amount: 25, balance: 25, used: false, createdAt: new Date().toISOString() },
    { id: "2", code: "GIFT-XYZ789", amount: 50, balance: 50, used: false, createdAt: new Date().toISOString() },
    { id: "3", code: "GIFT-QWE456", amount: 100, balance: 100, used: false, createdAt: new Date().toISOString() },
  ]);

  const [newAmount, setNewAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const generateGiftCardCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "GIFT-";
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateGiftCards = () => {
    setError("");
    setSuccessMessage("");

    if (!newAmount || !quantity) {
      setError("Please fill in all fields");
      return;
    }

    const amount = parseFloat(newAmount);
    const qty = parseInt(quantity);

    if (amount < 1) {
      setError("Amount must be at least $1");
      return;
    }

    if (qty < 1 || qty > 100) {
      setError("Quantity must be between 1 and 100");
      return;
    }

    const newCards: GiftCard[] = [];
    for (let i = 0; i < qty; i++) {
      newCards.push({
        id: Date.now().toString() + i,
        code: generateGiftCardCode(),
        amount: amount,
        balance: amount,
        used: false,
        createdAt: new Date().toISOString(),
      });
    }

    setGiftCards([...giftCards, ...newCards]);
    setNewAmount("");
    setQuantity("1");
    setSuccessMessage(`Successfully generated ${qty} gift card(s)`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteGiftCard = (id: string) => {
    setGiftCards(giftCards.filter(g => g.id !== id));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccessMessage("Code copied to clipboard!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header cartItemCount={0} onCartClick={() => {}} />

        <main style={{ flex: 1, padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px", color: "#000" }}>Gift Card Management</h1>
            <p style={{ color: "#666" }}>Create and manage digital gift cards</p>
          </div>

          {/* Generate Gift Cards Form */}
          <Card style={{ padding: "30px", marginBottom: "40px", backgroundColor: "#f5f5f5" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>Generate New Gift Cards</h2>

            {error && (
              <div style={{ backgroundColor: "#fee", padding: "12px", borderRadius: "4px", marginBottom: "20px", color: "#c00" }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{ backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "4px", marginBottom: "20px", color: "#2e7d32" }}>
                {successMessage}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "20px", alignItems: "flex-end" }}>
              <div>
                <Label style={{ display: "block", marginBottom: "8px", color: "#000", fontWeight: "500" }}>Gift Card Amount ($)</Label>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g., 50"
                  min="1"
                  step="0.01"
                  style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }}
                />
              </div>
              <div>
                <Label style={{ display: "block", marginBottom: "8px", color: "#000", fontWeight: "500" }}>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                  max="100"
                  style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }}
                />
              </div>
              <Button
                onClick={handleGenerateGiftCards}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6d28d9",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Plus size={18} />
                Generate
              </Button>
            </div>
          </Card>

          {/* Gift Cards List */}
          <Card style={{ padding: "30px", backgroundColor: "#f5f5f5" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>Gift Cards ({giftCards.length})</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Code</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Amount</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Balance</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Created</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#000" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {giftCards.map((card) => (
                    <tr key={card.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "12px", color: "#000", fontWeight: "600", fontFamily: "monospace", fontSize: "12px" }}>
                        {card.code}
                      </td>
                      <td style={{ padding: "12px", color: "#000", fontWeight: "600" }}>${card.amount.toFixed(2)}</td>
                      <td style={{ padding: "12px", color: "#000" }}>${card.balance.toFixed(2)}</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: card.used ? "#fee" : "#e8f5e9",
                            color: card.used ? "#c00" : "#2e7d32",
                          }}
                        >
                          {card.used ? "Used" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#666", fontSize: "14px" }}>
                        {new Date(card.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => handleCopyCode(card.code)}
                          style={{
                            padding: "6px 12px",
                            marginRight: "8px",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Copy size={14} />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteGiftCard(card.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {giftCards.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                No gift cards generated yet. Create one above to get started!
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
