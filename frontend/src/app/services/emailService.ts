import { EmailNotification, OnlineBooking, PaymentTransaction } from '../types';

/**
 * Mock Email Service
 * Simulates sending email notifications for bookings and payments
 */
export class EmailService {
  private static emailLog: EmailNotification[] = [];

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(booking: OnlineBooking, roomTypeName: string): Promise<EmailNotification> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: booking.guestEmail,
      subject: `Booking Confirmation - ${booking.id}`,
      template: 'booking_confirmation',
      data: {
        bookingId: booking.id,
        guestName: booking.guestName,
        roomType: roomTypeName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        status: booking.status
      },
      status: 'pending'
    };

    const result = await this.sendEmail(notification);
    this.emailLog.push(result);
    return result;
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(
    booking: OnlineBooking,
    transaction: PaymentTransaction
  ): Promise<EmailNotification> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: booking.guestEmail,
      subject: `Payment Receipt - ${booking.id}`,
      template: 'payment_receipt',
      data: {
        bookingId: booking.id,
        guestName: booking.guestName,
        transactionId: transaction.gatewayTransactionId,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        paymentDate: transaction.paymentDate,
        cardLastFour: transaction.cardLastFour,
        transactionStatus: transaction.transactionStatus
      },
      status: 'pending'
    };

    const result = await this.sendEmail(notification);
    this.emailLog.push(result);
    return result;
  }

  /**
   * Send cancellation notice email
   */
  static async sendCancellationNotice(booking: OnlineBooking, refundAmount?: number): Promise<EmailNotification> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: booking.guestEmail,
      subject: `Booking Cancellation - ${booking.id}`,
      template: 'cancellation_notice',
      data: {
        bookingId: booking.id,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        refundAmount: refundAmount,
        cancellationDate: new Date().toISOString()
      },
      status: 'pending'
    };

    const result = await this.sendEmail(notification);
    this.emailLog.push(result);
    return result;
  }

  /**
   * Send payment update email
   */
  static async sendPaymentUpdate(
    booking: OnlineBooking,
    paymentStatus: string,
    message: string
  ): Promise<EmailNotification> {
    const notification: EmailNotification = {
      id: this.generateId(),
      to: booking.guestEmail,
      subject: `Payment Update - ${booking.id}`,
      template: 'payment_update',
      data: {
        bookingId: booking.id,
        guestName: booking.guestName,
        paymentStatus: paymentStatus,
        message: message,
        updateDate: new Date().toISOString()
      },
      status: 'pending'
    };

    const result = await this.sendEmail(notification);
    this.emailLog.push(result);
    return result;
  }

  /**
   * Get all sent emails (for testing/debugging)
   */
  static getEmailLog(): EmailNotification[] {
    return [...this.emailLog];
  }

  /**
   * Clear email log
   */
  static clearEmailLog(): void {
    this.emailLog = [];
  }

  /**
   * Simulate sending an email
   */
  private static async sendEmail(notification: EmailNotification): Promise<EmailNotification> {
    await this.delay(800);

    const isSuccessful = Math.random() > 0.05;

    if (isSuccessful) {
      return {
        ...notification,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
    } else {
      return {
        ...notification,
        status: 'failed',
        errorMessage: 'SMTP connection timeout'
      };
    }
  }

  private static generateId(): string {
    return `EMAIL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
