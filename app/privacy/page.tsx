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

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="April 29, 2026">
      <div className="space-y-5">

        <div className="bg-[#f0ebff] border border-purple-100 rounded-xl p-5">
          <p className="text-sm text-[#5123d4] leading-relaxed">
            At computerservice.ng, we value your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, store, and protect your data when you use our services.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p className="text-sm text-gray-600 mb-4">We may collect the following information:</p>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-black mb-2">a. Personal Information</h3>
              <ul className="space-y-1.5">
                {["Full name", "Phone number", "Email address", "Residential or pickup address"].map(item => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black mb-2">b. Service Information</h3>
              <ul className="space-y-1.5">
                {["Uploaded documents (CVs, certificates, IDs, etc.)", "Application details and submitted data", "Technical device information (for support services)"].map(item => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black mb-2">c. Service Reference Information</h3>
              <ul className="space-y-1.5">
                {["Unique Service ID assigned to each request", "Any reference ID provided by the user for tracking or follow-up"].map(item => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section title="2. What We Do NOT Collect">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-3">
            <p className="text-sm font-medium text-green-700 mb-2">For your safety and privacy:</p>
            <ul className="space-y-1.5">
              {[
                "We do not collect or store login credentials (usernames, passwords, OTPs)",
                "We do not access user accounts directly",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-600">All services are handled using submitted information and Service IDs only.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p className="text-sm text-gray-600 mb-3">We use your information to:</p>
          <ul className="space-y-2">
            {[
              "Provide requested services (printing, application filling, tech support, etc.)",
              "Process and complete service requests based on the information you provide",
              "Communicate updates about your request",
              "Track and manage your request using your Service ID",
              "Improve our services",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="4. Document Handling &amp; Confidentiality">
          <ul className="space-y-2">
            {[
              "All documents uploaded are treated as strictly confidential",
              "Documents are only accessed to complete your request",
              "Your files are not shared with third parties, except when required to fulfill a service",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="5. Data Sharing">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-700">We do not sell or rent your personal data.</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">We may only share your data:</p>
          <ul className="space-y-2">
            {[
              "With trusted partners (e.g., partner business centers or agents) strictly to complete your request",
              "When required by law",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="6. Data Storage &amp; Security">
          <ul className="space-y-2">
            {[
              "We implement reasonable security measures to protect your data",
              "Access to your information is limited to authorized personnel only",
              "We avoid storing sensitive access credentials to reduce risk",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <p className="text-sm text-gray-600 mb-4">We retain user data only for as long as necessary to complete services, allow follow-up, and support reprints or corrections.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: "Standard services", value: "Up to 30 days" },
              { label: "Sensitive documents", value: "Up to 14 days" },
              { label: "User-controlled deletion", value: "Immediate on request" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#5123d4]">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">After the applicable retention period, all documents and related data are permanently deleted from our system.</p>
        </Section>

        <Section title="8. Your Rights">
          <p className="text-sm text-gray-600 mb-3">You have the right to:</p>
          <ul className="space-y-2">
            {[
              "Request access to your data",
              "Request correction of incorrect information",
              "Request deletion of your data at any time",
              "Withdraw consent where applicable",
            ].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </Section>

        <Section title="9. Cookies &amp; Tracking">
          <p className="text-sm text-gray-600 mb-3">We may use cookies to:</p>
          <ul className="space-y-2 mb-3">
            {["Improve user experience", "Analyze usage for service improvement"].map(item => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
          <p className="text-sm text-gray-600">You can disable cookies in your browser settings.</p>
        </Section>

        <Section title="10. Third-Party Links">
          <p className="text-sm text-gray-600">Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>
        </Section>

        <Section title="11. Updates to This Policy">
          <p className="text-sm text-gray-600">We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>
        </Section>

        <Section title="12. Contact Us">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <a href="mailto:support@computerservice.ng" className="text-sm font-medium text-[#5123d4] hover:underline">
                support@computerservice.ng
              </a>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm font-medium text-black">+234 8035671112</p>
            </div>
          </div>
        </Section>

        <div className="bg-[#190934] rounded-xl p-6 flex items-start gap-4">
          <span className="text-2xl">🔒</span>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Service Positioning Statement</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              computerservice.ng does not access user accounts and operates strictly as a document processing
              and service facilitation platform using user-provided information and Service IDs.
            </p>
          </div>
        </div>

      </div>
    </PolicyLayout>
  );
}
