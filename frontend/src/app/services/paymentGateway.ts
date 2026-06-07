import { PaymentGatewayRequest, PaymentGatewayResponse } from '../types';

/**
 * Mock Payment Gateway Service
 * Simulates processing payments through various payment methods
 */
export class PaymentGatewayService {
  private static mockDelay = 1500;

  /**
   * Process a payment transaction
   */
  static async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    await this.delay(this.mockDelay);

    const isSuccessful = Math.random() > 0.1;

    if (!isSuccessful) {
      return {
        success: false,
        transactionId: this.generateTransactionId(),
        amount: request.amount,
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: 'Payment declined by issuing bank'
      };
    }

    let cardLastFour: string | undefined;
    let cardType: string | undefined;

    if (request.paymentMethod === 'card' && request.cardDetails) {
      cardLastFour = request.cardDetails.cardNumber.slice(-4);
      cardType = this.detectCardType(request.cardDetails.cardNumber);
    }

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      amount: request.amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      message: 'Payment processed successfully',
      cardLastFour,
      cardType
    };
  }

  /**
   * Process a refund
   */
  static async processRefund(transactionId: string, amount: number): Promise<PaymentGatewayResponse> {
    await this.delay(this.mockDelay);

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      amount: amount,
      status: 'refunded',
      timestamp: new Date().toISOString(),
      message: `Refund processed for transaction ${transactionId}`
    };
  }

  /**
   * Verify a payment transaction
   */
  static async verifyTransaction(transactionId: string): Promise<boolean> {
    await this.delay(500);
    return true;
  }

  private static generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private static detectCardType(cardNumber: string): string {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Unknown';
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
