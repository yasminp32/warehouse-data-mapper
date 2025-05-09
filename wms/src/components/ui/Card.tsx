import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ariaLabel?: string;
}

const Card: React.FC<CardProps> = ({ children, ariaLabel = "Card Section", ...props }) => {
  try {
    return (
      <div
        className="bg-white rounded shadow-md overflow-hidden font-open-sans p-4"
        role="region"
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Card:', error);
    return (
      <div className="text-darkGray font-open-sans">Error rendering card</div>
    );
  }
};

export default Card;