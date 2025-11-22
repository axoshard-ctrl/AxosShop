import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { useCart } from "@/lib/cartContext";
import { Trash2, Plus, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  createdAt: string;
}

export default function Blog() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
  });
  const queryClient = useQueryClient();

  // Fetch blog posts
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Add blog post mutation
  const addPostMutation = useMutation({
    mutationFn: async (newPost: Omit<BlogPost, "id" | "createdAt">) => {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error("Failed to add post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setFormData({ title: "", description: "", videoUrl: "" });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add post",
        variant: "destructive",
      });
    },
  });

  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleAddPost = async () => {
    if (!formData.title || !formData.description || !formData.videoUrl) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addPostMutation.mutate(formData);
  };

  const isValidYouTubeUrl = (url: string) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-semibold text-primary">📹 Video Blog</span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                AxoShard Blog
              </h1>
              <p className="text-lg text-muted-foreground">
                Check out the latest videos and updates from the AxoShard community
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            )}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">No blog posts yet</p>
            {isAdmin && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40"
              >
                Create the first post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl overflow-hidden border border-primary/20 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 bg-card/50 backdrop-blur-sm flex flex-col group"
              >
                {/* Video Thumbnail */}
                <a 
                  href={post.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video bg-muted overflow-hidden relative block group/video cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700">
                    <Play className="w-16 h-16 text-white fill-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="text-white text-center">
                      <Play className="w-12 h-12 text-white fill-white mx-auto mb-2" />
                      <p className="text-sm font-semibold">Watch on YouTube</p>
                    </div>
                  </div>
                </a>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Add Video Post
            </DialogTitle>
            <DialogDescription>
              Share a YouTube or Vimeo video with the community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Title
              </label>
              <Input
                placeholder="Enter video title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-card/50 border-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Enter video description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-card/50 border-primary/20 focus:border-primary/50 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Video URL
              </label>
              <Input
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoUrl: e.target.value })
                }
                className="bg-card/50 border-primary/20 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports YouTube and Vimeo links
              </p>
              {formData.videoUrl &&
                !isValidYouTubeUrl(formData.videoUrl) && (
                  <p className="text-xs text-destructive mt-2">
                    Please enter a valid YouTube or Vimeo URL
                  </p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 border-primary/20 hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPost}
                disabled={
                  addPostMutation.isPending ||
                  !isValidYouTubeUrl(formData.videoUrl)
                }
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 text-white font-semibold"
              >
                {addPostMutation.isPending ? "Adding..." : "Add Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
