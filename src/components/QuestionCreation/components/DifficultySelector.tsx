import React from 'react';
import { Badge } from 'reactstrap';

interface DifficultyOption {
  value: string;
  label: string;
  color: string;
}

interface DifficultySelectorProps {
  selectedDifficulty?: string;
  onDifficultyChange: (difficulty: string) => void;
  options: DifficultyOption[];
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  options
}) => {
  return (
    <div className="d-flex gap-2 flex-wrap">
      {options.map((option) => (
        <Badge
          key={option.value}
          color={selectedDifficulty === option.value ? option.color : 'outline-secondary'}
          className={`cursor-pointer p-2 ${
            selectedDifficulty === option.value ? 'selected' : 'selectable'
          }`}
          onClick={() => onDifficultyChange(option.value)}
          style={{
            cursor: 'pointer',
            border: selectedDifficulty === option.value ? 'none' : '1px solid #dee2e6',
            backgroundColor: selectedDifficulty === option.value ? undefined : 'transparent',
            color: selectedDifficulty === option.value ? 'white' : '#6c757d'
          }}
        >
          {option.label}
        </Badge>
      ))}
    </div>
  );
};

export default DifficultySelector;