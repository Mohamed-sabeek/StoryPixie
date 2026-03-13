import React from 'react';
import CustomSelect from './CustomSelect';

interface LengthSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const lengths = [
  'Short',
  'Medium',
  'Long'
];

export default function LengthSelector({ value, onChange }: LengthSelectorProps) {
  return (
    <CustomSelect 
      label="Story Length"
      value={value}
      onChange={onChange}
      options={lengths.map(length => ({ label: length, value: length.toLowerCase() }))}
    />
  );
}
