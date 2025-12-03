import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: number; // in cents
  orderId: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  onSuccess: (captureId: string, orderId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalCheckoutButton({
  amount,
  orderId,
  email,
  firstName,
  lastName,
  address,
  city,
  state,
  zip,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    // Load PayPal script
    if (!window.paypal && clientId && clientId !== 'your_paypal_client_id_here') {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setIsReady(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        onError?.('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setIsReady(true);
    }
  }, [clientId, onError]);

  useEffect(() => {
    if (!isReady || !window.paypal) return;

    // Clear previous buttons
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    window.paypal.Buttons({
      createOrder: async () => {
        try {
          setIsProcessing(true);
          
          const response = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              orderId,
              email,
              firstName,
              lastName,
              address,
              city,
              state,
              zip,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create PayPal order');
          }

          const data = await response.json();
          console.log('PayPal order created:', data.orderId);
          return data.orderId;
        } catch (error) {
          console.error('Error creating order:', error);
          toast({
            title: 'Error',
            description: 'Failed to create payment order. Please try again.',
            variant: 'destructive',
          });
          onError?.((error as Error).message);
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          setIsProcessing(true);

          const response = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to capture payment');
          }

          const captureData = await response.json();
          console.log('Payment captured:', captureData);

          toast({
            title: 'Success',
            description: 'Payment completed successfully!',
            variant: 'default',
          });

          onSuccess(captureData.captureId, data.orderID);
        } catch (error) {
          console.error('Error capturing order:', error);
          toast({
            title: 'Error',
            description: 'Failed to complete payment. Please try again.',
            variant: 'destructive',
          });
          onError?.((error as Error).message);
        } finally {
          setIsProcessing(false);
        }
      },

      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({
          title: 'Payment Error',
          description: err.message || 'An error occurred during payment.',
          variant: 'destructive',
        });
        onError?.(err.message);
        setIsProcessing(false);
      },

      onCancel: () => {
        console.log('Payment cancelled');
        toast({
          title: 'Cancelled',
          description: 'Payment was cancelled.',
        });
        setIsProcessing(false);
      },

      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'pill',
        label: 'pay',
      },
    }).render('#paypal-button-container');
  }, [isReady, amount, orderId, email, firstName, lastName, address, city, state, zip, onSuccess, onError, toast]);

  if (!isReady) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2">Loading PayPal...</span>
        </div>
      </Card>
    );
  }

  if (!clientId || clientId === 'your_paypal_client_id_here') {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-200">PayPal is not configured. Please contact support.</p>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div
        id="paypal-button-container"
        className="paypal-button-container"
      />
      {isProcessing && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Processing payment...
        </div>
      )}
    </div>
  );
}
