// Payment type utilities and helpers

export type PaymentType = 'trip' | 'event';

export interface BasePayment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  tripId?: string | null;
  eventId?: string | null;
  ticketQuantity?: number | null;
}

/**
 * Determine if a payment is for a trip
 */
export function isTripPayment(payment: BasePayment): boolean {
  return payment.tripId !== null && payment.tripId !== undefined;
}

/**
 * Determine if a payment is for an event
 */
export function isEventPayment(payment: BasePayment): boolean {
  return payment.eventId !== null && payment.eventId !== undefined;
}

/**
 * Get the payment type
 */
export function getPaymentType(payment: BasePayment): PaymentType | null {
  if (isTripPayment(payment)) return 'trip';
  if (isEventPayment(payment)) return 'event';
  return null;
}

/**
 * Calculate total amount from an array of payments
 */
export function calculateTotalAmount(payments: BasePayment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/**
 * Calculate total amount for paid payments only
 */
export function calculatePaidAmount(payments: BasePayment[]): number {
  return payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

/**
 * Filter payments by type
 */
export function filterPaymentsByType(
  payments: BasePayment[],
  type: PaymentType
): BasePayment[] {
  if (type === 'trip') {
    return payments.filter(isTripPayment);
  }
  return payments.filter(isEventPayment);
}

/**
 * Get payment type label for display
 */
export function getPaymentTypeLabel(payment: BasePayment): string {
  const type = getPaymentType(payment);
  if (type === 'trip') return 'Trip Payment';
  if (type === 'event') return 'Event Ticket';
  return 'Unknown';
}

/**
 * Get payment type badge variant
 */
export function getPaymentTypeBadgeVariant(payment: BasePayment): 'default' | 'secondary' | 'outline' {
  const type = getPaymentType(payment);
  if (type === 'trip') return 'outline';
  if (type === 'event') return 'secondary';
  return 'default';
}

/**
 * Format payment description for display
 */
export function formatPaymentDescription(
  payment: BasePayment,
  tripCountry?: string,
  eventTitle?: string
): string {
  if (isTripPayment(payment) && tripCountry) {
    return `Trip to ${tripCountry}`;
  }
  if (isEventPayment(payment) && eventTitle) {
    const quantity = payment.ticketQuantity || 1;
    return `${quantity} ${quantity === 1 ? 'ticket' : 'tickets'} for ${eventTitle}`;
  }
  return 'Payment';
}
