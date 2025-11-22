export interface RestockNotification {
  productId: string;
  email: string;
  productName: string;
}

export class RestockService {
  private static readonly API_URL = '/api/restock';

  static async subscribeToRestock(
    productId: string,
    email: string
  ): Promise<void> {
    const response = await fetch(`${this.API_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to restock notifications');
    }
  }

  static async unsubscribeFromRestock(
    productId: string,
    email: string
  ): Promise<void> {
    const response = await fetch(`${this.API_URL}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to unsubscribe from restock notifications');
    }
  }
}
