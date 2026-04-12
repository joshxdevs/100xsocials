import React from 'react';

interface PremiumToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PremiumToggle: React.FC<PremiumToggleProps> = ({ id, checked, onChange }) => {
  return (
    <input 
      type="checkbox" 
      id={id} 
      className="premium-switch" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
    />
  );
};

export default PremiumToggle;
