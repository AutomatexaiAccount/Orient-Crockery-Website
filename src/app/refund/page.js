export const metadata = {
  title: 'Cancellation & Refund Policy | Orient Crockeries',
  description: 'Cancellation and Refund Policy for Orient Crockeries',
};

export default function RefundPage() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '2rem', textAlign: 'center' }}>Cancellation & Refund Policy</h1>
      
      <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>

        <p>At Orient Crockeries, we strive to ensure that you are fully satisfied with your purchase. If for any reason you are not completely satisfied, we are here to help.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>1. Order Cancellation</h2>
        <p>Orders can only be cancelled before they are dispatched from our warehouse. If you wish to cancel your order, please contact us immediately at support@orientcrockeries.com or call our customer service. Once an order has been shipped, it cannot be cancelled.</p>
        <p>For prepaid orders that are cancelled before dispatch, the full amount will be refunded to the original payment method within 5-7 business days.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>2. Returns</h2>
        <p>We accept returns within 7 days of delivery only if the product received is damaged, defective, or incorrect. Due to the fragile nature of our products (crockery and glassware), we do not accept returns for buyer's remorse or change of mind.</p>
        <p>To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. You will also need to provide the receipt or proof of purchase.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>3. Damaged or Defective Items</h2>
        <p>If your order arrives damaged, you must notify us within 48 hours of delivery. Please send an email to support@orientcrockeries.com with your order number and clear photos of the damaged item and the packaging. We will arrange for a replacement or a refund after verifying the claim.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>4. Refunds Process</h2>
        <p>Once we receive your returned item, our team will inspect it and notify you of the status of your refund. If your return is approved, we will initiate a refund to your credit card (or original method of payment) through our payment gateway provider (Razorpay).</p>
        <p>You will receive the credit within 5-7 business days, depending on your card issuer's policies.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>5. Contact Us</h2>
        <p>If you have any questions on how to return your item to us, please contact us at support@orientcrockeries.com or call our showroom at +91 (555) 123-4567.</p>
      </div>
    </main>
  );
}
