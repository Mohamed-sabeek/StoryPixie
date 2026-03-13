import React from 'react';
import CustomSelect from './CustomSelect';

interface GenreSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const genres = [
  'Fantasy',
  'Sci-Fi',
  'Adventure',
  'Mystery',
  'Horror',
  'Kids Story',
  'Comedy',
  'Motivational'
];

export default function GenreSelector({ value, onChange }: GenreSelectorProps) {
  return (
    <CustomSelect 
      label="Genre"
      value={value}
      onChange={onChange}
      options={genres.map(g => ({ label: g, value: g.toLowerCase() }))}
    />
  );
}
