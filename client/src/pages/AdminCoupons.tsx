import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Trash2, Plus } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  active: boolean;
  createdAt: string;
}

export default function AdminCoupons() {
  const { language } = useLanguage();
  const isDarkMode = false; // or get from context if available
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: "1", code: "SAVE10", discount: 10, active: true, createdAt: new Date().toISOString() },
    { id: "2", code: "SAVE20", discount: 20, active: true, createdAt: new Date().toISOString() },
    { id: "3", code: "WELCOME", discount: 15, active: true, createdAt: new Date().toISOString() },
  ]);

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [error, setError] = useState("");

  const handleAddCoupon = () => {
    setError("");

    if (!newCode || !newDiscount) {
      setError("Please fill in all fields");
      return;
    }

    const discount = parseInt(newDiscount);
    if (discount < 1 || discount > 100) {
      setError("Discount must be between 1 and 100");
      return;
    }

    // Check if code already exists
    if (coupons.some(c => c.code.toUpperCase() === newCode.toUpperCase())) {
      setError("Coupon code already exists");
      return;
    }

    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCode.toUpperCase(),
      discount: discount,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setCoupons([...coupons, coupon]);
    setNewCode("");
    setNewDiscount("");
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header cartItemCount={0} onCartClick={() => {}} />

        <main style={{ flex: 1, padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px", color: "#000" }}>Coupon Management</h1>
            <p style={{ color: "#666" }}>Create and manage promotional coupon codes</p>
          </div>

          {/* Add Coupon Form */}
          <Card style={{ padding: "30px", marginBottom: "40px", backgroundColor: "#f5f5f5" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>Create New Coupon</h2>

            {error && (
              <div style={{ backgroundColor: "#fee", padding: "12px", borderRadius: "4px", marginBottom: "20px", color: "#c00" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "20px", alignItems: "flex-end" }}>
              <div>
                <Label style={{ display: "block", marginBottom: "8px", color: "#000", fontWeight: "500" }}>Coupon Code</Label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SUMMER2024"
                  style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }}
                />
              </div>
              <div>
                <Label style={{ display: "block", marginBottom: "8px", color: "#000", fontWeight: "500" }}>Discount (%)</Label>
                <Input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  placeholder="e.g., 15"
                  min="1"
                  max="100"
                  style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", width: "100%" }}
                />
              </div>
              <Button
                onClick={handleAddCoupon}
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
                Add Coupon
              </Button>
            </div>
          </Card>

          {/* Coupons List */}
          <Card style={{ padding: "30px", backgroundColor: "#f5f5f5" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px", color: "#000" }}>Active Coupons ({coupons.length})</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Code</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Discount</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#000" }}>Created</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#000" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "12px", color: "#000", fontWeight: "600" }}>{coupon.code}</td>
                      <td style={{ padding: "12px", color: "#000" }}>{coupon.discount}% off</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: coupon.active ? "#e8f5e9" : "#fee",
                            color: coupon.active ? "#2e7d32" : "#c00",
                          }}
                        >
                          {coupon.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#666", fontSize: "14px" }}>
                        {new Date(coupon.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleCoupon(coupon.id)}
                          style={{
                            padding: "6px 12px",
                            marginRight: "8px",
                            backgroundColor: coupon.active ? "#fbbf24" : "#6d28d9",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {coupon.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
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

            {coupons.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                No coupons created yet. Create one above to get started!
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
