import React, { useState, useCallback, useEffect } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import MinimalLayout from '@/components/layout/MinimalLayout';

interface ContactPageProps {}

const ContactPage: React.FC<ContactPageProps> = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const contactPageTimingId = PerformanceMonitor.startMeasuring('ContactPage Render');
    return () => {
      PerformanceMonitor.stopMeasuring(contactPageTimingId);
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = useCallback((setState: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputText = event.target.value;
    const sanitizedText = inputText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    setState(sanitizedText);
  }, []);

  const handleSubmit = useCallback(() => {
    setNameError(null);
    setEmailError(null);
    setMessageError(null);
    setSubmitError(null);
    setSuccessMessage(null);

    let hasErrors = false;

    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      hasErrors = true;
    }

    if (!email.trim()) {
      setEmailError('Email cannot be empty.');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format.');
      hasErrors = true;
    }

    if (!message.trim()) {
      setMessageError('Message cannot be empty.');
      hasErrors = true;
    }

    if (hasErrors) {
      setSubmitError('Please correct the errors below.');
      return;
    }

    try {
      console.log('Form data:', { name, email, message });
      setSuccessMessage('Form submitted successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (e: any) {
      console.error('Error submitting form:', e);
      setSubmitError(`Failed to submit form: ${e.message}`);
    }
  }, [name, email, message]);

  return (
    <MinimalLayout>
      <div className="container mx-auto p-4 font-open-sans">
        <FadeIn>
          <Card ariaLabel="Contact Form Section">
            <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">Contact Us</h2>
            <div className="p-4">
              {submitError && (
                <div className="text-red-500 font-open-sans text-center mt-2">{`Error: ${submitError}`}</div>
              )}
              {successMessage && (
                <div className="text-teal font-open-sans text-center mt-2">{successMessage}</div>
              )}
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2" aria-label="Name label">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-darkGray leading-tight focus:outline-none focus:shadow-outline font-open-sans"
                  placeholder="Your Name"
                  value={name}
                  onChange={handleInputChange(setName)}
                  aria-label="Your Name"
                />
                {nameError && (
                  <p className="text-red-500 text-xs italic">{nameError}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2" aria-label="Email Label">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-darkGray leading-tight focus:outline-none focus:shadow-outline font-open-sans"
                  placeholder="Your Email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  aria-label="Your Email"
                />
                {emailError && (
                  <p className="text-red-500 text-xs italic">{emailError}</p>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2" aria-label="Message Label">
                  Message:
                </label>
                <textarea
                  id="message"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-darkGray leading-tight focus:outline-none focus:shadow-outline font-open-sans"
                  placeholder="Your Message"
                  value={message}
                  onChange={handleInputChange(setMessage)}
                  aria-label="Your Message"
                />
                {messageError && (
                  <p className="text-red-500 text-xs italic">{messageError}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="medium"
                  ariaLabel="Submit Contact Form"
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </MinimalLayout>
  );
};

export default ContactPage;