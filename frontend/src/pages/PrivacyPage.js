import React from "react";
import "./PrivacyPage.css";

const PrivacyPage = () => {
  const privacyPolicy = {
    introduction:
      "Welcome to our Privacy Policy page. Your privacy is incredibly important to us, and we are committed to safeguarding your personal information. This policy outlines the types of data we collect, how we use it, and the steps we take to protect it. Please take a moment to review this document, as it is essential for understanding your rights and our responsibilities regarding your personal data.",
    informationCollection:
      "We collect personal information when you use our services. This may include but is not limited to your name, email address, IP address, and usage data such as how you interact with our platform. This information helps us provide you with a personalized experience and improve our services. We may also collect data from third-party integrations that you use.",
    useOfInformation:
      "We use the collected information to offer and improve our services, communicate with you, personalize your experience, and comply with legal obligations. This includes, but is not limited to, sending you service updates, promotional content (if you have opted in), and addressing any inquiries or requests you make.",
    dataProtection:
      "We implement robust security measures to protect your data from unauthorized access, loss, or misuse. This includes encryption methods, secure servers, and access controls to ensure your information remains confidential. However, please note that no system is completely secure, and while we strive to protect your data, we cannot guarantee its absolute security.",
    yourRights:
      "As a user, you have several rights regarding your personal data. These include the right to access, correct, or delete the data we hold about you. You may also withdraw your consent to the processing of your data at any time. To exercise any of these rights, please contact us using the details provided below. We will respond promptly to your request.",
    thirdPartyLinks:
      "Our platform may contain links to external websites or services that are not owned or controlled by us. Please be aware that we are not responsible for the privacy practices of these third-party sites. We encourage you to read their privacy policies before sharing any personal information.",
    cookies:
      "We use cookies to improve your experience on our website. Cookies are small text files stored on your device that allow us to remember your preferences and recognize your visits. You can control the use of cookies through your browser settings. Please note that disabling cookies may impact the functionality of our platform.",
    changes:
      "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page, and we encourage you to review this policy periodically to stay informed about how we are protecting your information.",
    contactInfo:
      "If you have any questions or concerns about this Privacy Policy, or if you wish to exercise your rights regarding your personal data, please contact us at the following email: [2023sl93059@wilp.bits-pilani.ac.in]. We are committed to resolving any issues promptly and transparently.",
  };

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1 className="privacy-title">Privacy Policy</h1>

        <section className="privacy-section">
          <h2>Introduction</h2>
          <p>{privacyPolicy.introduction}</p>
        </section>

        <section className="privacy-section">
          <h2>Information Collection</h2>
          <p>{privacyPolicy.informationCollection}</p>
        </section>

        <section className="privacy-section">
          <h2>Use of Information</h2>
          <p>{privacyPolicy.useOfInformation}</p>
        </section>

        <section className="privacy-section">
          <h2>Data Protection</h2>
          <p>{privacyPolicy.dataProtection}</p>
        </section>

        <section className="privacy-section">
          <h2>Your Rights</h2>
          <p>{privacyPolicy.yourRights}</p>
        </section>

        <section className="privacy-section">
          <h2>Third-Party Links</h2>
          <p>{privacyPolicy.thirdPartyLinks}</p>
        </section>

        <section className="privacy-section">
          <h2>Cookies</h2>
          <p>{privacyPolicy.cookies}</p>
        </section>

        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>{privacyPolicy.changes}</p>
        </section>

        <section className="privacy-section">
          <h2>Contact Information</h2>
          <p>{privacyPolicy.contactInfo}</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
