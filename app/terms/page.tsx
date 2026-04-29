"use client";

import PolicyLayout from "../components/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms and Conditions" lastUpdated="April 29, 2026">
      <div className="space-y-8 text-gray-700">
        <section>
          <p className="text-sm text-gray-600 italic mb-4">
            Welcome to computerservice.ng (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These Terms and Conditions govern your use of our website and services. By accessing or using our services, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">1. About Our Services</h2>
          <p className="mb-3">computerservice.ng provides digital and physical computer-related services, including but not limited to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Document typing and formatting</li>
            <li>Printing and scanning</li>
            <li>Online registrations and submissions</li>
            <li>Laptop and computer repair</li>
            <li>General IT support services</li>
          </ul>
          <p className="mt-3">We may update or modify services at any time without prior notice.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">2. Acceptance of Terms</h2>
          <p className="mb-2">By using our website or placing an order, you:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Confirm that you are legally capable of entering a binding agreement</li>
            <li>Agree to comply with all applicable laws in Nigeria</li>
            <li>Accept these Terms in full</li>
          </ul>
          <p className="mt-3">If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">3. User Responsibilities</h2>
          <p className="mb-2">You agree to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Provide accurate and complete information</li>
            <li>Ensure documents submitted are lawful and legitimate</li>
            <li>Not use our service for fraud, illegal activities, or misrepresentation</li>
          </ul>
          <p className="mt-3">We reserve the right to refuse service if misuse is suspected.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">4. Service Delivery</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Services are delivered based on the information you provide</li>
            <li>Turnaround time depends on service type and workload</li>
            <li>We are not responsible for delays caused by third parties (e.g., government portals, network issues)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">5. Payments and Pricing</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>All services must be paid for before or upon delivery (unless otherwise agreed)</li>
            <li>Prices may change without prior notice</li>
            <li>Payments are non-refundable once service has commenced, except in cases of proven error on our part</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">6. Document Handling & Liability</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>We handle documents with care but do not guarantee outcomes (e.g., approvals, submissions)</li>
            <li>We are not liable for:
              <ul className="list-circle list-inside space-y-1 ml-4 mt-2">
                <li>Rejections from institutions</li>
                <li>Errors caused by incorrect information provided by you</li>
                <li>Loss due to third-party systems</li>
              </ul>
            </li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">This aligns with standard service agreements where outcomes cannot be guaranteed.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">7. Intellectual Property</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>All website content (text, logos, graphics) belongs to computerservice.ng</li>
            <li>You may not copy, reproduce, or distribute without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">8. Privacy</h2>
          <p>Your personal information is handled according to our Privacy Policy and applicable Nigerian data protection regulations.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">9. Service Refusal & Termination</h2>
          <p className="mb-2">We may suspend or terminate access if:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>You violate these terms</li>
            <li>You engage in fraudulent or abusive behavior</li>
            <li>There is misuse of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">10. Limitation of Liability</h2>
          <p className="mb-2">To the fullest extent permitted by law:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>We are not liable for indirect or consequential losses</li>
            <li>Our total liability is limited to the amount paid for the service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">11. Changes to Terms</h2>
          <p>We may update these Terms at any time. Continued use of our services means you accept the updated terms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">12. Governing Law</h2>
          <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            For questions about these Terms and Conditions, please contact us at <a href="mailto:support@computerservice.ng" className="text-blue-600 hover:text-blue-700">support@computerservice.ng</a>
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
