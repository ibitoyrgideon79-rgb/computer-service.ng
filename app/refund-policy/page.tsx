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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <span className="w-1.5 h-1.5 rounded-full bg-[#5123d4] mt-2 shrink-0" />
      {children}
    </li>
  );
}

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="April 29, 2026">
      <div className="space-y-5">

        <div className="bg-[#f0ebff] border border-purple-100 rounded-xl p-5">
          <p className="text-sm text-[#5123d4] leading-relaxed">
            At computerservice.ng, we are committed to delivering high-quality computer and document-related services.
            This Refund Policy explains when refunds may or may not be issued.
          </p>
        </div>

        <Section title="1. General Policy">
          <p className="text-sm text-gray-600">
            Due to the nature of our services (digital work, technical services, and time-based labor),
            all payments are generally non-refundable once service has started, except as stated below.
          </p>
        </Section>

        <Section title="2. Eligible Refund Cases">
          <p className="text-sm text-gray-600 mb-3">You may qualify for a refund if:</p>
          <div className="space-y-2">
            {[
              "We are unable to deliver the service you paid for",
              "There is a verified error caused by our team",
              "You were charged incorrectly (duplicate or excess payment)",
            ].map(item => (
              <div key={item} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3">
                <span className="text-green-500 text-base mt-0.5">✓</span>
                <p className="text-sm text-green-700">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">In such cases, refunds will be processed after review and approval.</p>
        </Section>

        <Section title="3. Non-Refundable Cases">
          <p className="text-sm text-gray-600 mb-3">Refunds will <strong>not</strong> be issued if:</p>
          <div className="space-y-2">
            {[
              "Work has already commenced or been completed",
              "You provided incorrect, incomplete, or misleading information",
              "A submission or application is rejected by a third party (e.g., government agency, school, or organization)",
              "Delays occur due to external systems, network issues, or third-party platforms",
              "You change your mind after work has started",
            ].map(item => (
              <div key={item} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
                <span className="text-red-400 text-base mt-0.5">✕</span>
                <p className="text-sm text-red-700">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Cancellation Policy">
          <ul className="space-y-2">
            {[
              "Orders can only be canceled before work begins",
              "Once work has started, cancellation is not allowed",
              "If canceled early, a partial refund may apply, minus any administrative costs",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="5. Laptop &amp; Device Repair Services">
          <ul className="space-y-2">
            {[
              "Diagnostic fees (if any) are non-refundable",
              "Once repair work has started or parts have been purchased, no refund will be issued",
              "If we are unable to fix the issue after payment for repair (excluding diagnostic), a partial refund may be considered",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="6. Refund Processing Time">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px] bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-[#5123d4] mb-1">3–7</p>
              <p className="text-xs text-gray-600">Business days for approved refunds</p>
            </div>
            <div className="flex-1 min-w-[180px] bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-black mb-1">Original payment method</p>
              <p className="text-xs text-gray-500">or agreed alternative</p>
            </div>
          </div>
        </Section>

        <Section title="7. Dispute Resolution">
          <p className="text-sm text-gray-600 mb-3">If you are not satisfied with a service:</p>
          <ul className="space-y-2">
            {[
              "Contact us first to resolve the issue",
              "We may offer a revision, correction, or service redo instead of a refund where appropriate",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="8. Contact for Refund Requests">
          <p className="text-sm text-gray-600 mb-4">To request a refund, contact us and provide:</p>
          <ul className="space-y-2 mb-5">
            {["Your name", "Service requested", "Proof of payment", "Reason for refund request"].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <a href="mailto:support@computerservice.ng" className="text-sm font-medium text-[#5123d4] hover:underline">
                support@computerservice.ng
              </a>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Phone / WhatsApp</p>
              <p className="text-sm font-medium text-black">+234 8035671112</p>
            </div>
          </div>
        </Section>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">
            We appreciate your business and are committed to ensuring your satisfaction.
            If you have any questions about this Refund Policy, please don&apos;t hesitate to contact us.
          </p>
        </div>

      </div>
    </PolicyLayout>
  );
}
