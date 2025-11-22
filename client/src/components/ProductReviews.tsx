import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, User, X, Image as ImageIcon } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");

  const { data: reviews = [], refetch } = useQuery({
    queryKey: [`/api/products/${productId}/reviews`],
  }) as any;

  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create review");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Review posted successfully!" });
      setTitle("");
      setComment("");
      setRating(5);
      setPhotoUrls([]);
      setPhotoInput("");
      refetch();
    },
    onError: () => {
      toast({ title: "Failed to post review", variant: "destructive" });
    },
  });

  const handleAddPhoto = () => {
    if (!photoInput.trim()) {
      toast({ title: "Please enter a valid URL", variant: "destructive" });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(photoInput);
      if (photoUrls.length >= 5) {
        toast({ title: "Maximum 5 photos allowed", variant: "destructive" });
        return;
      }
      setPhotoUrls([...photoUrls, photoInput]);
      setPhotoInput("");
    } catch {
      toast({ title: "Please enter a valid URL", variant: "destructive" });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in to leave a review", variant: "destructive" });
      return;
    }
    if (!title || !comment) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createReviewMutation.mutate({
      userId: user.id,
      rating,
      title,
      comment,
      photos: photoUrls.length > 0 ? JSON.stringify(photoUrls) : undefined,
    });
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{averageRating}</div>
        <div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating as any)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Write Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoveredRating(i + 1)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 transition ${
                        i < (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                placeholder="Summarize your review..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <Textarea
                placeholder="Share your detailed thoughts about this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Paste image URL (e.g., https://example.com/photo.jpg)"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                  />
                  <Button 
                    type="button"
                    onClick={handleAddPhoto}
                    variant="outline"
                    size="sm"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {photoUrls.length}/5 photos • Maximum 5 photos per review
                </p>

                {/* Photo Preview Grid */}
                {photoUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {photoUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Review ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={() => {
                            toast({ title: "Image failed to load", variant: "destructive" });
                            handleRemovePhoto(index);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="w-full"
            >
              {createReviewMutation.isPending ? "Posting..." : "Post Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <h3 className="font-semibold">{review.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700">{review.comment}</p>

                  {/* Review Photos */}
                  {review.photos && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Photos from reviewer:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(() => {
                          try {
                            const photos = JSON.parse(review.photos);
                            return photos.map((photo: string, idx: number) => (
                              <img
                                key={idx}
                                src={photo}
                                alt={`Review photo ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            ));
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3" />
                    <span>User ID: {review.userId.slice(0, 8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
