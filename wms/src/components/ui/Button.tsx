import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  ariaLabel,
}) => {
  let buttonStyle =
    'rounded transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  switch (variant) {
    case 'primary':
      buttonStyle +=
        ' bg-blue-500 text-white font-roboto hover:bg-teal focus:ring-blue-500';
      break;
    case 'secondary':
      buttonStyle +=
        ' bg-transparent text-darkGray font-open-sans border border-darkGray hover:bg-gray-100 focus:ring-gray-300';
      break;
    case 'text':
      buttonStyle +=
        ' bg-transparent text-blue-500 font-montserrat hover:text-teal focus:ring-teal';
      break;
    default:
      buttonStyle += ' bg-blue-500 text-white font-roboto hover:bg-teal';
  }

  switch (size) {
    case 'small':
      buttonStyle += ' p-2 text-montserrat text-sm';
      break;
    case 'medium':
      buttonStyle += ' p-4 text-montserrat text-base';
      break;
    case 'large':
      buttonStyle += ' p-6 text-montserrat text-lg';
      break;
    default:
      buttonStyle += ' p-4 text-montserrat text-base';
  }

  if (disabled) {
    buttonStyle += ' opacity-50 cursor-not-allowed bg-gray-500 text-gray-500 hover:bg-gray-500 hover:text-gray-500';
  }

  return (
    <button
      onClick={onClick}
      className={buttonStyle}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;