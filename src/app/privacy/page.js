export const metadata = {
  title: 'Privacy Policy | Orient Crockeries',
  description: 'Privacy Policy for Orient Crockeries',
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--dark)', marginBottom: '2rem', textAlign: 'center' }}>Privacy Policy</h1>
      
      <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>

        <p>At Orient Crockeries, accessible from orientcrockeries.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Orient Crockeries and how we use it.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>1. Information We Collect</h2>
        <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
        <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
        <p>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>2. How We Use Your Information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
          <li>Process your transactions and manage your orders</li>
          <li>Find and prevent fraud</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>3. Log Files</h2>
        <p>Orient Crockeries follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>4. Cookies and Web Beacons</h2>
        <p>Like any other website, Orient Crockeries uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>5. Third-Party Privacy Policies</h2>
        <p>Orient Crockeries's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. For example, all payments are securely processed through Razorpay, which adheres to its own strict privacy and security guidelines.</p>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--dark)', marginTop: '1rem' }}>6. Contact Us</h2>
        <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at support@orientcrockeries.com.</p>
      </div>
    </main>
  );
}
