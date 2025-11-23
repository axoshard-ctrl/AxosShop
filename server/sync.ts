import "dotenv/config";

const RENDER_API_URL = process.env.RENDER_API_URL || process.env.VITE_RENDER_API_URL;

interface SyncPayload {
  products?: Record<string, any>;
  users?: Record<string, any>;
  orders?: Record<string, any>;
  orderItems?: Record<string, any>;
  blogPosts?: Record<string, any>;
  productReviews?: Record<string, any>;
  coupons?: Record<string, any>;
}

export async function syncToRender(data: SyncPayload): Promise<boolean> {
  if (!RENDER_API_URL) {
    console.warn("RENDER_API_URL not configured. Skipping sync to Render.");
    return false;
  }

  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Sync failed with status ${response.status}`);
      return false;
    }

    console.log("Data synced to Render successfully");
    return true;
  } catch (error) {
    console.error("Error syncing to Render:", error);
    return false;
  }
}

export async function syncProduct(product: any): Promise<boolean> {
  if (!RENDER_API_URL) return false;
  
  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
      body: JSON.stringify({ product }),
    });

    if (!response.ok) {
      console.error(`Product sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Product ${product.id} synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing product to Render:", error);
    return false;
  }
}

export async function deleteProductFromRender(productId: string): Promise<boolean> {
  if (!RENDER_API_URL) return false;

  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/product/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
    });

    if (!response.ok) {
      console.error(`Product delete sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Product ${productId} deletion synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing product deletion to Render:", error);
    return false;
  }
}

export async function syncBlogPost(post: any): Promise<boolean> {
  if (!RENDER_API_URL) return false;
  
  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
      body: JSON.stringify({ post }),
    });

    if (!response.ok) {
      console.error(`Blog post sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Blog post ${post.id} synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing blog post to Render:", error);
    return false;
  }
}

export async function deleteBlogPostFromRender(postId: string): Promise<boolean> {
  if (!RENDER_API_URL) return false;

  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/blog/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
    });

    if (!response.ok) {
      console.error(`Blog post delete sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Blog post ${postId} deletion synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing blog post deletion to Render:", error);
    return false;
  }
}

export async function syncProductReview(review: any): Promise<boolean> {
  if (!RENDER_API_URL) return false;
  
  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
      body: JSON.stringify({ review }),
    });

    if (!response.ok) {
      console.error(`Review sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Review ${review.id} synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing review to Render:", error);
    return false;
  }
}

export async function deleteProductReviewFromRender(reviewId: string): Promise<boolean> {
  if (!RENDER_API_URL) return false;

  try {
    const response = await fetch(`${RENDER_API_URL}/api/sync/review/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": process.env.SYNC_TOKEN || "default-sync-token",
      },
    });

    if (!response.ok) {
      console.error(`Review delete sync failed with status ${response.status}`);
      return false;
    }

    console.log(`Review ${reviewId} deletion synced to Render`);
    return true;
  } catch (error) {
    console.error("Error syncing review deletion to Render:", error);
    return false;
  }
}
