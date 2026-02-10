import React from 'react';
import { Modal, ModalFooter, Button } from './index';

interface LegalModalsProps {
  showTerms: boolean;
  showPrivacy: boolean;
  showHelp: boolean;
  onCloseTerms: () => void;
  onClosePrivacy: () => void;
  onCloseHelp: () => void;
}

export function LegalModals({
  showTerms,
  showPrivacy,
  showHelp,
  onCloseTerms,
  onClosePrivacy,
  onCloseHelp,
}: LegalModalsProps) {
  return (
    <>
      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={showTerms}
        onClose={onCloseTerms}
        title="Terms & Conditions"
        size="lg"
      >
        <div className="py-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 text-[14px] text-[#1F2121]">
            <div>
              <h3 className="font-semibold text-[16px] mb-2">1. Acceptance of Terms</h3>
              <p className="text-[#6B7C7C]">
                By accessing and using Remsana, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">2. Service Description</h3>
              <p className="text-[#6B7C7C]">
                Remsana provides business registration services and educational content for Nigerian SMEs. We facilitate CAC business name registration and offer a 100-day learning programme.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">3. Registration Service</h3>
              <p className="text-[#6B7C7C]">
                Business registration services are provided at a fee of ₦25,000 per registration. This includes verification, CAC submission, and certificate delivery. Processing time is up to one month.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">4. User Responsibilities</h3>
              <p className="text-[#6B7C7C]">
                Users are responsible for providing accurate information and required documents. False information may result in registration rejection without refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">5. Refund Policy</h3>
              <p className="text-[#6B7C7C]">
                Refunds are only available if registration is rejected due to errors on our part. Refunds are not available for user-provided incorrect information or document issues.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">6. Learning Programme</h3>
              <p className="text-[#6B7C7C]">
                The 100-day learning programme is provided free of charge. Content is for educational purposes only and does not constitute professional advice.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">7. Limitation of Liability</h3>
              <p className="text-[#6B7C7C]">
                Remsana is not liable for any indirect, incidental, or consequential damages arising from the use of our services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">8. Changes to Terms</h3>
              <p className="text-[#6B7C7C]">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={onCloseTerms}
              className="w-full"
            >
              I Understand
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacy}
        onClose={onClosePrivacy}
        title="Privacy Policy"
        size="lg"
      >
        <div className="py-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 text-[14px] text-[#1F2121]">
            <div>
              <h3 className="font-semibold text-[16px] mb-2">1. Information We Collect</h3>
              <p className="text-[#6B7C7C]">
                We collect personal information including name, email, phone number, business details, and documents necessary for registration services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">2. How We Use Your Information</h3>
              <p className="text-[#6B7C7C]">
                Your information is used to process business registrations, provide learning services, send updates, and improve our platform. We do not sell your personal data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">3. Data Security</h3>
              <p className="text-[#6B7C7C]">
                We implement industry-standard security measures to protect your data. All documents are encrypted and stored securely. Access is restricted to authorized personnel only.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">4. Data Sharing</h3>
              <p className="text-[#6B7C7C]">
                We share necessary information with CAC for registration purposes. We may share anonymized data for analytics. We do not share personal data with third parties for marketing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">5. Your Rights</h3>
              <p className="text-[#6B7C7C]">
                You have the right to access, correct, or delete your personal data. You can request data export or account deletion at any time by contacting support@remsana.com.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">6. Cookies and Tracking</h3>
              <p className="text-[#6B7C7C]">
                We use cookies to improve your experience, remember preferences, and analyze usage. You can disable cookies in your browser settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">7. Data Retention</h3>
              <p className="text-[#6B7C7C]">
                We retain your data for as long as necessary to provide services and comply with legal obligations. Registration documents are retained for 12 months after completion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[16px] mb-2">8. Compliance</h3>
              <p className="text-[#6B7C7C]">
                We comply with Nigeria Data Protection Regulation (NDPR) and GDPR requirements. For questions about privacy, contact our Data Protection Officer at privacy@remsana.com.
              </p>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={onClosePrivacy}
              className="w-full"
            >
              I Understand
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Help/FAQ Modal */}
      <Modal
        isOpen={showHelp}
        onClose={onCloseHelp}
        title="Help & FAQ"
        size="lg"
      >
        <div className="py-4">
          <div className="max-h-[60vh] overflow-y-auto space-y-6">
            <div>
              <h3 className="font-semibold text-[16px] mb-3 text-[#1F2121]">Registration Service</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: What is included in the ₦25,000 registration fee?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: The fee covers information verification, CAC application submission, registration processing, and Business Name Certificate delivery.</p>
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: How long does registration take?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: Maximum one month from payment. Typically: 2-3 days verification + 5 days CAC submission + 10-21 days CAC processing.</p>
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: Can I pay by bank transfer?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: Yes. We accept Paystack, Flutterwave, and direct bank transfers. For bank transfer, you'll be provided with account details.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-[16px] mb-3 text-[#1F2121]">Learning Programme</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: Is the learning programme really free?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: Yes, completely free for all users. It's complementary to the registration service.</p>
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: How long does the 100-day course take?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: It's designed for 100 days, but you can go at your own pace. Each lesson is 5-15 minutes.</p>
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[#1F2121] mb-1">Q: Will I get a certificate after completing?</p>
                  <p className="text-[14px] text-[#6B7C7C]">A: Yes, a digital completion certificate is issued after finishing all 100 lessons and achieving 70%+ on quizzes.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[16px] mb-3 text-[#1F2121]">Support</h3>
              <div className="p-4 bg-[#f3f0fa] rounded-[8px]">
                <p className="text-[14px] text-[#1F2121] mb-2">
                  <strong>Email Support:</strong> support@remsana.com
                </p>
                <p className="text-[14px] text-[#1F2121] mb-2">
                  <strong>Response Time:</strong> Within 24 hours
                </p>
                <p className="text-[14px] text-[#1F2121]">
                  <strong>Hours:</strong> Monday-Friday, 9 AM - 5 PM WAT
                </p>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button
              variant="primary"
              size="md"
              onClick={onCloseHelp}
              className="w-full"
            >
              Close
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
