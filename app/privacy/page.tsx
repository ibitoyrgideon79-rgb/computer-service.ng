"use client";

import PolicyLayout from "../components/PolicyLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="April 29, 2026">
      <div className="space-y-8 text-gray-700">
        <section>
          <p className="text-sm text-gray-600 italic mb-4">
            At computerservice.ng, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">1. Information We Collect</h2>
          <p className="mb-3">We may collect the following information:</p>
          
          <h3 className="text-lg font-semibold mb-2 text-black">a. Personal Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Residential or pickup address</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-black">b. Service Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-4">
            <li>Uploaded documents (CVs, certificates, IDs, etc.)</li>
            <li>Application details and submitted data</li>
            <li>Technical device information (for support services)</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-black">c. Service Reference Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Unique Service ID assigned to each request</li>
            <li>Any reference ID provided by the user for tracking or follow-up</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">2. What We Do NOT Collect</h2>
          <p className="mb-3">For your safety and privacy:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>We do not collect or store login credentials (usernames, passwords, OTPs)</li>
            <li>We do not access user accounts directly</li>
          </ul>
          <p className="mt-3">All services are handled using submitted information and Service IDs only.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">3. How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Provide requested services (printing, application filling, tech support, etc.)</li>
            <li>Process and complete service requests based on the information you provide</li>
            <li>Communicate updates about your request</li>
            <li>Track and manage your request using your Service ID</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">4. Document Handling & Confidentiality</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>All documents uploaded are treated as strictly confidential</li>
            <li>Documents are only accessed to complete your request</li>
            <li>Your files are not shared with third parties, except when required to fulfill a service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">5. Data Sharing</h2>
          <p className="mb-3">We do not sell or rent your personal data.</p>
          <p className="mb-2">We may only share your data:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>With trusted partners (e.g., partner business centers or agents) strictly to complete your request</li>
            <li>When required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">6. Data Storage & Security</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>We implement reasonable security measures to protect your data</li>
            <li>Access to your information is limited to authorized personnel only</li>
            <li>We avoid storing sensitive access credentials to reduce risk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">7. Data Retention</h2>
          <p className="mb-3">We retain user data only for as long as necessary to complete services, allow follow-up, and support reprints or corrections.</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
            <li>Standard services: Data is retained for up to 30 days</li>
            <li>Sensitive documents: Data is retained for up to 14 days</li>
            <li>User-controlled deletion: Users may request immediate deletion after service completion</li>
          </ul>
          <p>After the applicable retention period, all documents and related data are permanently deleted from our system.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">8. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Request access to your data</li>
            <li>Request correction of incorrect information</li>
            <li>Request deletion of your data at any time</li>
            <li>Withdraw consent where applicable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">9. Cookies & Tracking</h2>
          <p className="mb-2">We may use cookies to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mb-3">
            <li>Improve user experience</li>
            <li>Analyze usage for service improvement</li>
          </ul>
          <p>You can disable cookies in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">10. Third-Party Links</h2>
          <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">11. Updates to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">12. Contact Us</h2>
          <div className="bg-gray-50 p-4 rounded-lg ml-2 space-y-2">
            <p><span className="font-medium">Email:</span> <a href="mailto:support@computerservice.ng" className="text-blue-600 hover:text-blue-700">support@computerservice.ng</a></p>
            <p><span className="font-medium">Phone:</span> +234 8035671112</p>
          </div>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-200 bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-black">🔒 Service Positioning Statement</h3>
          <p className="text-sm text-gray-700">
            computerservice.ng does not access user accounts and operates strictly as a document processing and service facilitation platform using user-provided information and Service IDs.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
