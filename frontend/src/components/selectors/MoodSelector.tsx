import React from 'react';
import CustomSelect from './CustomSelect';

interface MoodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const moods = [
  'Happy',
  'Dark',
  'Epic',
  'Funny',
  'Emotional'
];

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <CustomSelect 
      label="Story Mood"
      value={value}
      onChange={onChange}
      options={moods.map(mood => ({ label: mood, value: mood.toLowerCase() }))}
    />
  );
}
