"use client";

import PolicyLayout from "../components/PolicyLayout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-black flex items-center gap-3">
        <span className="w-1 h-5 bg-[#5123d4] rounded-full inline-block shrink-0" />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms and Conditions" lastUpdated="April 29, 2026">
      <div className="space-y-5">

        <div className="bg-[#f0ebff] border border-purple-100 rounded-xl p-5">
          <p className="text-sm text-[#5123d4] leading-relaxed">
            Welcome to computerservice.ng (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These Terms and Conditions govern your
            use of our website and services. By accessing or using our services, you agree to these terms.
          </p>
        </div>

        <Section title="1. About Our Services">
          <p className="text-sm text-gray-600 mb-3">computerservice.ng provides digital and physical computer-related services, including but not limited to:</p>
          <ul className="space-y-2">
            {["Document typing and formatting", "Printing and scanning", "Online registrations and submissions", "Laptop and computer repair", "General IT support services"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-3">We may update or modify services at any time without prior notice.</p>
        </Section>

        <Section title="2. Acceptance of Terms">
          <p className="text-sm text-gray-600 mb-3">By using our website or placing an order, you:</p>
          <ul className="space-y-2">
            {["Confirm that you are legally capable of entering a binding agreement", "Agree to comply with all applicable laws in Nigeria", "Accept these Terms in full"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-3">If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="3. User Responsibilities">
          <p className="text-sm text-gray-600 mb-3">You agree to:</p>
          <ul className="space-y-2">
            {["Provide accurate and complete information", "Ensure documents submitted are lawful and legitimate", "Not use our service for fraud, illegal activities, or misrepresentation"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-3">We reserve the right to refuse service if misuse is suspected.</p>
        </Section>

        <Section title="4. Service Delivery">
          <ul className="space-y-2">
            {[
              "Services are delivered based on the information you provide",
              "Turnaround time depends on service type and workload",
              "We are not responsible for delays caused by third parties (e.g., government portals, network issues)",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="5. Payments and Pricing">
          <ul className="space-y-2">
            {[
              "All services must be paid for before or upon delivery (unless otherwise agreed)",
              "Prices may change without prior notice",
              "Payments are non-refundable once service has commenced, except in cases of proven error on our part",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="6. Document Handling &amp; Liability">
          <ul className="space-y-2 mb-3">
            {[
              "We handle documents with care but do not guarantee outcomes (e.g., approvals, submissions)",
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mb-2">We are not liable for:</p>
          <ul className="space-y-2 ml-4">
            {["Rejections from institutions", "Errors caused by incorrect information provided by you", "Loss due to third-party systems"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-700">This aligns with standard service agreements where outcomes cannot be guaranteed.</p>
          </div>
        </Section>

        <Section title="7. Intellectual Property">
          <ul className="space-y-2">
            {["All website content (text, logos, graphics) belongs to computerservice.ng", "You may not copy, reproduce, or distribute without permission"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="8. Privacy">
          <p className="text-sm text-gray-600">Your personal information is handled according to our Privacy Policy and applicable Nigerian data protection regulations.</p>
        </Section>

        <Section title="9. Service Refusal &amp; Termination">
          <p className="text-sm text-gray-600 mb-3">We may suspend or terminate access if:</p>
          <ul className="space-y-2">
            {["You violate these terms", "You engage in fraudulent or abusive behavior", "There is misuse of our platform"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="10. Limitation of Liability">
          <p className="text-sm text-gray-600 mb-3">To the fullest extent permitted by law:</p>
          <ul className="space-y-2">
            {["We are not liable for indirect or consequential losses", "Our total liability is limited to the amount paid for the service"].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="11. Changes to Terms">
          <p className="text-sm text-gray-600">We may update these Terms at any time. Continued use of our services means you accept the updated terms.</p>
        </Section>

        <Section title="12. Governing Law">
          <p className="text-sm text-gray-600">These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
        </Section>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">
            For questions about these Terms and Conditions, please contact us at{" "}
            <a href="mailto:support@computerservice.ng" className="text-[#5123d4] hover:underline font-medium">
              support@computerservice.ng
            </a>
          </p>
        </div>

      </div>
    </PolicyLayout>
  );
}
