import React from 'react';
import { IconType } from 'react-icons';
import { IconBaseProps } from 'react-icons/lib';

interface IconWrapperProps extends Omit<IconBaseProps, 'children'> {
  Icon: IconType;
  className?: string;
}

// This type assertion approach safely tells TypeScript that we know what we're doing
// when passing the IconType to React.createElement
const IconWrapper: React.FC<IconWrapperProps> = ({ Icon, size = 20, color, className, ...props }) => {
  // Cast the IconType to a FunctionComponent that React.createElement accepts
  const IconComponent = Icon as React.FunctionComponent<IconBaseProps>;

  return (
    <span className={className}>
      {React.createElement(IconComponent, { size, color, ...props })}
    </span>
  );
};

export default IconWrapper;