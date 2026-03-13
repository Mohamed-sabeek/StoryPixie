import React from 'react';
import CustomSelect from './CustomSelect';

interface SceneSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const sceneCounts = [3, 5, 7, 10];

export default function SceneSelector({ value, onChange }: SceneSelectorProps) {
  return (
    <CustomSelect 
      label="Scene Count"
      value={value}
      onChange={(v) => onChange(Number(v))}
      options={sceneCounts.map(count => ({ label: count.toString(), value: count }))}
    />
  );
}
