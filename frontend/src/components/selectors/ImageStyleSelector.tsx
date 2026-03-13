import React from 'react';
import CustomSelect from './CustomSelect';

interface ImageStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const imageStyles = [
  'Pixar Style',
  'Anime',
  'Disney Style',
  'Realistic',
  'Comic Book',
  'Watercolor',
  '3D Render'
];

export default function ImageStyleSelector({ value, onChange }: ImageStyleSelectorProps) {
  return (
    <CustomSelect 
      label="Image Style"
      value={value}
      onChange={onChange}
      options={imageStyles.map(style => ({ 
        label: style, 
        value: style.toLowerCase().replace(' ', '_') 
      }))}
    />
  );
}
