import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { PaymentMethod } from '../../types';

interface PaymentProcessorProps {
  amount: number;
  bookingId: string;
  onPaymentComplete: (success: boolean, transactionId?: string, cardLastFour?: string) => void;
}

export default function PaymentProcessor({ amount, bookingId, onPaymentComplete }: PaymentProcessorProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        setErrorMessage('Please fill in all card details');
        return;
      }
    }

    setProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const { PaymentGatewayService } = await import('../../services/paymentGateway');

      const response = await PaymentGatewayService.processPayment({
        amount,
        currency: 'USD',
        paymentMethod,
        customerEmail: 'guest@email.com',
        customerName: cardDetails.cardholderName || 'Guest',
        bookingReference: bookingId,
        cardDetails: paymentMethod === 'card' ? cardDetails : undefined
      });

      if (response.success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentComplete(true, response.transactionId, response.cardLastFour);
        }, 1500);
      } else {
        setPaymentStatus('error');
        setErrorMessage(response.error || 'Payment failed');
        setProcessing(false);
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('An unexpected error occurred');
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  return (
    <div className="space-y-4">
      {paymentStatus === 'idle' || paymentStatus === 'processing' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Amount to pay: <span className="font-bold text-lg">${amount.toFixed(2)}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                }`}
              >
                <span className="font-medium">Online Banking</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  disabled={processing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  disabled={processing}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Month *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryMonth}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value.replace(/\D/g, '').substr(0, 2) })}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={processing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryYear}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value.replace(/\D/g, '').substr(0, 2) })}
                    placeholder="YY"
                    maxLength={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={processing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').substr(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                    disabled={processing}
                  />
                </div>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {processing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </button>
        </form>
      ) : paymentStatus === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
          <p className="text-gray-600 dark:text-gray-300">Your payment has been processed successfully.</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Payment Failed</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              setPaymentStatus('idle');
              setErrorMessage('');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
