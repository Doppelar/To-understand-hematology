import { useState } from 'react';
import FilterBar from '../FilterBar';

export default function FilterBarExample() {
  const [activeSpecialties, setActiveSpecialties] = useState<string[]>(['MCL']);
  const [activeRegions, setActiveRegions] = useState<string[]>(['関東']);

  const handleToggleSpecialty = (specialty: string) => {
    setActiveSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleToggleRegion = (region: string) => {
    setActiveRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleClearAll = () => {
    setActiveSpecialties([]);
    setActiveRegions([]);
  };

  return (
    <div className="p-4 max-w-2xl bg-background">
      <FilterBar
        activeSpecialties={activeSpecialties}
        activeRegions={activeRegions}
        availableSpecialties={['MCL', '移植', 'カスタム専門']}
        onToggleSpecialty={handleToggleSpecialty}
        onToggleRegion={handleToggleRegion}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
