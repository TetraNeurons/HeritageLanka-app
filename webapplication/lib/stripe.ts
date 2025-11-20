import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'lkr', // Sri Lankan Rupee
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/traveler/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/traveler/payment/cancel`,
} as const;

// Payment calculation utility function
export function calculatePaymentAmount(
  totalDistance: number,
  numberOfPeople: number,
  needsGuide: boolean
): number {
  // Formula: (distance * 10) + (people * 500) + (guide ? 5000 : 0)
  const distanceCost = totalDistance * 10;
  const peopleCost = numberOfPeople * 500;
  const guideCost = needsGuide ? 5000 : 0;
  
  return distanceCost + peopleCost + guideCost;
}
