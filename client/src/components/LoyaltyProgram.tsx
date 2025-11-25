import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Zap, Star, TrendingUp } from "lucide-react";

interface UserLoyaltyStats {
  userId: string;
  totalPoints: number;
  pointsThisMonth: number;
  totalSpent: number;
  totalOrders: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  nextTierPoints: number;
  availableRewards: number;
}

interface LoyaltyProgramProps {
  stats: UserLoyaltyStats;
}

export function LoyaltyProgram({ stats }: LoyaltyProgramProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-gradient-to-r from-blue-400 to-purple-500 text-white";
      case "gold":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "silver":
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-black";
      case "bronze":
        return "bg-gradient-to-r from-orange-600 to-red-600 text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "💎";
      case "gold":
        return "🏆";
      case "silver":
        return "⭐";
      case "bronze":
        return "🎖️";
      default:
        return "🎯";
    }
  };

  const progressPercentage = (stats.totalPoints / stats.nextTierPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Status</CardTitle>
          <CardDescription>Your current membership tier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-6 rounded-lg ${getTierColor(stats.tier)} space-y-2`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold opacity-80">Current Tier</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {getTierIcon(stats.tier)} {stats.tier.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Total Points</p>
                <p className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress to Next Tier</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalPoints} / {stats.nextTierPoints}
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points This Month */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  +{stats.pointsThisMonth}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Rewards</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.availableRewards}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Benefits</CardTitle>
          <CardDescription>What you get at each loyalty tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { tier: "Bronze", icon: "🎖️", benefits: ["1 point per $1 spent", "Early access to sales"] },
              { tier: "Silver", icon: "⭐", benefits: ["1.5 points per $1 spent", "Free shipping on orders over $50", "Birthday bonus"] },
              { tier: "Gold", icon: "🏆", benefits: ["2 points per $1 spent", "Free shipping on all orders", "Priority support", "Exclusive sales"] },
              { tier: "Platinum", icon: "💎", benefits: ["3 points per $1 spent", "Free express shipping", "VIP support line", "Early access to new products", "Monthly bonus points"] },
            ].map((tier) => (
              <div key={tier.tier} className="border-l-4 border-primary pl-4 py-2">
                <p className="font-semibold text-foreground">
                  {tier.icon} {tier.tier}
                </p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
