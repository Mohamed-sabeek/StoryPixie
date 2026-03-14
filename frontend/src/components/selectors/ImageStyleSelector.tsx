import React from 'react';
import CustomSelect from './CustomSelect';

interface ImageStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const imageStyles = [
  { label: '3D Animated', prompt: '3D animated movie style, colorful lighting, cinematic composition' },
  { label: 'Anime Illustration', prompt: 'anime style illustration, vibrant colors, dramatic lighting' },
  { label: 'Fantasy Concept Art', prompt: 'epic fantasy concept art, cinematic lighting, highly detailed' },
  { label: 'Storybook Illustration', prompt: 'children\'s storybook illustration, soft lighting, whimsical art style' },
  { label: 'Realistic Cinematic', prompt: 'photorealistic cinematic lighting, ultra detailed, dramatic atmosphere' },
  { label: 'Comic Book Illustration', prompt: 'comic book illustration style, bold lines, vibrant colors' }
];

export default function ImageStyleSelector({ value, onChange }: ImageStyleSelectorProps) {
  return (
    <CustomSelect 
      label="Image Style"
      value={value}
      onChange={onChange}
      options={imageStyles.map(style => ({ 
        label: style.label, 
        value: style.prompt 
      }))}
    />
  );
}
