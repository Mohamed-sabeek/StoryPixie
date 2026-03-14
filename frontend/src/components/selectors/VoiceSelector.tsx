import React from 'react';
import CustomSelect from './CustomSelect';

interface VoiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const voices = [
  'Male Narrator',
  'Female Narrator'
];

export default function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  return (
    <CustomSelect 
      label="Voice Narration"
      value={value}
      onChange={onChange}
      options={voices.map(voice => ({ 
        label: voice, 
        value: voice.toLowerCase().replace(/\s+/g, '_') 
      }))}
    />
  );
}
