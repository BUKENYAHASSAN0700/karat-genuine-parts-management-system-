import React from 'react';

export interface UIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  type?: 'rr' | 'br' | 'sr'; // regular-rounded, bold-rounded, solid-rounded
  className?: string;
}

export const UIcon: React.FC<UIconProps> = ({ 
  name, 
  type = 'rr', 
  className = '',
  ...props 
}) => {
  return (
    <i 
      className={`fi fi-${type}-${name} inline-flex items-center justify-center leading-none ${className}`} 
      {...props}
    />
  );
};

export default UIcon;
