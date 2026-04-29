"use client";

import PolicyLayout from "../components/PolicyLayout";

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="April 29, 2026">
      <div className="space-y-8 text-gray-700">
        <section>
          <p className="text-sm text-gray-600 italic mb-4">
            At computerservice.ng, we are committed to delivering high-quality computer and document-related services. This Refund Policy explains when refunds may or may not be issued.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">1. General Policy</h2>
          <p>Due to the nature of our services (digital work, technical services, and time-based labor), all payments are generally non-refundable once service has started, except as stated below.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">2. Eligible Refund Cases</h2>
          <p className="mb-2">You may qualify for a refund if:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>We are unable to deliver the service you paid for</li>
            <li>There is a verified error caused by our team</li>
            <li>You were charged incorrectly (duplicate or excess payment)</li>
          </ul>
          <p className="mt-3">In such cases, refunds will be processed after review and approval.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">3. Non-Refundable Cases</h2>
          <p className="mb-2">Refunds will NOT be issued if:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Work has already commenced or been completed</li>
            <li>You provided incorrect, incomplete, or misleading information</li>
            <li>A submission or application is rejected by a third party (e.g., government agency, school, or organization)</li>
            <li>Delays occur due to external systems, network issues, or third-party platforms</li>
            <li>You change your mind after work has started</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">4. Cancellation Policy</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Orders can only be canceled before work begins</li>
            <li>Once work has started, cancellation is not allowed</li>
            <li>If canceled early, a partial refund may apply, minus any administrative costs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">5. Laptop & Device Repair Services</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Diagnostic fees (if any) are non-refundable</li>
            <li>Once repair work has started or parts have been purchased, no refund will be issued</li>
            <li>If we are unable to fix the issue after payment for repair (excluding diagnostic), a partial refund may be considered</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">6. Refund Processing Time</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Approved refunds will be processed within 3–7 business days</li>
            <li>Refunds will be made via the original payment method or an agreed alternative</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">7. Dispute Resolution</h2>
          <p className="mb-2">If you are not satisfied with a service:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Contact us first to resolve the issue</li>
            <li>We may offer a revision, correction, or service redo instead of a refund where appropriate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-black">8. Contact for Refund Requests</h2>
          <p className="mb-3">To request a refund, contact:</p>
          <div className="bg-gray-50 p-4 rounded-lg ml-2 space-y-2">
            <p><span className="font-medium">Email:</span> <a href="mailto:support@computerservice.ng" className="text-blue-600 hover:text-blue-700">support@computerservice.ng</a></p>
            <p><span className="font-medium">Phone/WhatsApp:</span> +234 8035671112</p>
          </div>
          <p className="mt-4 mb-2">Please provide:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Your name</li>
            <li>Service requested</li>
            <li>Proof of payment</li>
            <li>Reason for refund request</li>
          </ul>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            We appreciate your business and are committed to ensuring your satisfaction. If you have any questions about this Refund Policy, please don&apos;t hesitate to contact us.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
