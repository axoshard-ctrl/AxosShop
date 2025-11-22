import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ReviewModeration } from "@shared/schema";

interface ReviewWithModeration {
  review: {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    author: string;
    photos?: string[];
    createdAt: string;
  };
  moderation?: ReviewModeration;
}

export function ReviewModeration() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedReview, setSelectedReview] = useState<ReviewWithModeration | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: moderationQueue, isLoading } = useQuery<ReviewWithModeration[]>({
    queryKey: ["/api/admin/reviews/moderation", filterStatus],
    queryFn: async () => {
      const queryParam = filterStatus && filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const response = await fetch(`/api/admin/reviews/moderation${queryParam}`);
      if (!response.ok) throw new Error("Failed to fetch moderation queue");
      return response.json();
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      reason?: string;
    }) =>
      apiRequest("POST", `/api/admin/reviews/${id}/moderate`, {
        status,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews/moderation"] });
      toast({
        title: "Success",
        description: `Review ${action}!`,
      });
      setIsDecisionDialogOpen(false);
      setSelectedReview(null);
      setRejectionReason("");
      setAction(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${action} review`,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (!selectedReview) return;
    setAction("approve");
    setIsDecisionDialogOpen(true);
  };

  const handleRejectClick = () => {
    if (!selectedReview) return;
    setAction("reject");
    setIsDecisionDialogOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedReview || !action) return;

    if (action === "reject" && !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    const reviewModerationId = selectedReview.moderation?.id;
    if (!reviewModerationId) {
      toast({
        title: "Error",
        description: "Review moderation record not found",
        variant: "destructive",
      });
      return;
    }

    const status = action === "approve" ? "approved" : "rejected";
    await moderateMutation.mutateAsync({
      id: reviewModerationId,
      status,
      reason: action === "reject" ? rejectionReason : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review Moderation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve customer feedback
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">Filter by:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : moderationQueue && moderationQueue.length > 0 ? (
        <div className="space-y-4">
          {moderationQueue.map((item) => (
            <Card key={item.review.id} className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{item.review.title}</h3>
                    {item.moderation && getStatusBadge(item.moderation.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {item.review.author} •{" "}
                    {new Date(item.review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-foreground line-clamp-3">{item.review.comment}</p>

              {/* Photos */}
              {item.review.photos && item.review.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.review.photos.slice(0, 3).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Review photo ${i + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  ))}
                  {item.review.photos.length > 3 && (
                    <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                      +{item.review.photos.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Reason (if applicable) */}
              {item.moderation?.status === "rejected" && item.moderation.reason && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                    REJECTION REASON
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {item.moderation.reason}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                {item.moderation?.status === "pending" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedReview(item);
                        handleApprove();
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedReview(item);
                        handleRejectClick();
                      }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedReview(item);
                      handleRejectClick();
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Change Status
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    /* Delete functionality would go here */
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No reviews to moderate in this category
          </p>
        </Card>
      )}

      {/* Decision Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Review?" : "Reject Review?"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "This review will be published and visible to customers."
                : "Provide a reason for rejecting this review."}
            </DialogDescription>
          </DialogHeader>

          {action === "reject" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Reason for Rejection</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Inappropriate content, Spam, Misleading information..."
                  className="mt-2"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This reason may be shared with the reviewer.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDecisionDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDecision}
              disabled={moderateMutation.isPending}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {moderateMutation.isPending
                ? "Processing..."
                : action === "approve"
                  ? "Approve Review"
                  : "Reject Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
