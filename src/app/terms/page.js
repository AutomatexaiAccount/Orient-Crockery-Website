export const metadata = {
  title: 'Terms & Conditions | Orient Crockeries',
  description: 'Terms and Conditions for Orient Crockeries',
};

export default function TermsPage() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '2rem', textAlign: 'center' }}>Terms and Conditions</h1>
      
      <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>

        <p>Welcome to Orient Crockeries. These terms and conditions outline the rules and regulations for the use of our website, located at orientcrockeries.com.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>1. Acceptance of Terms</h2>
        <p>By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Orient Crockeries if you do not accept all of the terms and conditions stated on this page.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>2. Products and Pricing</h2>
        <p>All products listed on the website are subject to availability. We reserve the right to modify or discontinue any product at any time. Prices for our products are subject to change without notice. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>3. Payment Terms</h2>
        <p>We accept payments via standard gateways, including Razorpay. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>4. Intellectual Property</h2>
        <p>Unless otherwise stated, Orient Crockeries and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use subject to restrictions set in these terms and conditions.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>5. User Accounts</h2>
        <p>If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>6. Limitation of Liability</h2>
        <p>In no event shall Orient Crockeries, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>7. Governing Law</h2>
        <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Jaipur, Rajasthan.</p>
        
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>8. Contact Us</h2>
        <p>If you have any queries regarding any of our terms, please contact us at support@orientcrockeries.com.</p>
      </div>
    </main>
  );
}
