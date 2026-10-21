import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5", size = 20 }) => {
  const IconMap = Icons as Record<string, any>;
  const IconComponent = IconMap[name] || Icons.Recycle;
  return <IconComponent className={className} size={size} />;
};
