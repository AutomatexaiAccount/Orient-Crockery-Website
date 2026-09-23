export const metadata = {
  title: 'Shipping & Delivery Policy | Orient Crockeries',
  description: 'Shipping and Delivery Policy for Orient Crockeries',
};

export default function ShippingPage() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '2rem', textAlign: 'center' }}>Shipping & Delivery Policy</h1>
      
      <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>

        <p>Thank you for visiting and shopping at Orient Crockeries. Following are the terms and conditions that constitute our Shipping Policy.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>1. Shipment Processing Time</h2>
        <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.</p>
        <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>2. Shipping Rates & Delivery Estimates</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>Standard Delivery:</strong> 3-7 business days</li>
          <li><strong>Local Pickup (Jaipur):</strong> Available from our showroom during business hours.</li>
        </ul>
        <p>Delivery delays can occasionally occur due to unforeseen circumstances with our courier partners.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>3. Shipment Confirmation & Order Tracking</h2>
        <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>4. Damages</h2>
        <p>Orient Crockeries takes immense care in packaging our fragile items (crockery, glassware) using premium secure packaging. However, if you receive a damaged item, please save all packaging materials and damaged goods and contact our customer service team immediately with photographic evidence.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>5. Contact Us</h2>
        <p>If you have any questions about our shipping policy, please contact us at support@orientcrockeries.com or call our showroom at +91 (555) 123-4567.</p>
      </div>
    </main>
  );
}
