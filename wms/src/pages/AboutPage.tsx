import React, { useEffect, useState } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import MinimalLayout from '@/components/layout/MinimalLayout';

interface AboutPageProps {}

const AboutPage: React.FC<AboutPageProps> = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const aboutPageTimingId = PerformanceMonitor.startMeasuring('AboutPage Render');
    console.log("About Page rendered");
    return () => {
      PerformanceMonitor.stopMeasuring(aboutPageTimingId);
    };
  }, []);

  try {
    return (
      <MinimalLayout>
        <div className="container mx-auto p-4 font-open-sans">
          <FadeIn>
            <Card ariaLabel="About the Company">
              <div className="p-4">
                <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">
                  About WMS MVP
                </h2>
                <p className="text-lg text-gray-500 font-open-sans">
                  The Warehouse Management System (WMS) MVP is designed to revolutionize
                  warehouse operations through efficient SKU-MSKU mapping, data cleaning,
                  and AI-driven analytics. Our goal is to provide businesses with the tools
                  they need to optimize inventory, reduce errors, and gain actionable insights.
                </p>
              </div>
            </Card>
          </FadeIn>

          <FadeIn>
            <Card ariaLabel="Our Team">
              <div className="p-4">
                <h3 className="text-2xl font-semibold text-darkGray font-roboto mb-4">Our Team</h3>
                <p className="text-lg text-gray-500 font-open-sans">
                  The WMS MVP is brought to you by a dedicated team of experts in
                  software development, data science, and warehouse management.
                  Our team members include:
                </p>
                <ul className="list-disc list-inside text-gray-500 font-open-sans">
                  <li>
                    **John Doe:** Lead Software Engineer - Architecting and developing the core
                    WMS functionalities.
                  </li>
                  <li>
                    **Jane Smith:** Data Scientist - Designing and implementing AI algorithms
                    for data analysis and optimization.
                  </li>
                  <li>
                    **David Lee:** Warehouse Management Expert - Providing domain expertise
                    and ensuring the WMS meets real-world needs.
                  </li>
                </ul>
              </div>
            </Card>
          </FadeIn>

          <FadeIn>
            <Card ariaLabel="Technologies Used">
              <div className="p-4">
                <h3 className="text-2xl font-semibold text-darkGray font-roboto mb-4">Technologies Used</h3>
                <p className="text-lg text-gray-500 font-open-sans">
                  The WMS MVP is built using a modern technology stack to ensure
                  performance, scalability, and maintainability:
                </p>
                <ul className="list-disc list-inside text-gray-500 font-open-sans">
                  <li>
                    **React:** A JavaScript library for building user interfaces, providing
                    a component-based architecture and efficient rendering.
                  </li>
                  <li>
                    **Three.js:** A JavaScript 3D library for creating immersive and interactive
                    3D visualizations of warehouse environments.
                  </li>
                  <li>
                    **GSAP (GreenSock Animation Platform):** A JavaScript animation library
                    used for creating smooth and engaging animations.
                  </li>
                  <li>
                    **Tailwind CSS:** A utility-first CSS framework for rapidly designing
                    consistent and visually appealing user interfaces.
                  </li>
                  <li>
                    **Python:** Used for backend services, data cleaning, and AI-driven
                    analytics.
                  </li>
                  <li>
                    **Pandas:** A data manipulation and analysis library for handling
                    structured data.
                  </li>
                  <li>
                    **Flask:** A micro web framework for building APIs and backend services.
                  </li>
                </ul>
              </div>
            </Card>
          </FadeIn>
        </div>
      </MinimalLayout>
    );
  } catch (error: any) {
    console.error('Error rendering AboutPage:', error);
    setError(`Error rendering AboutPage: ${error.message}`);
    return (
      <MinimalLayout>
        <div className="container mx-auto p-4 font-open-sans">
          <Card ariaLabel="Error Section">
            <div className="text-red-500 font-open-sans text-center">
              Error: {error}
            </div>
          </Card>
        </div>
      </MinimalLayout>
    );
  }
};

export default AboutPage;