import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

type FilterBarProps = {
  activeSpecialties: string[];
  activeRegions: string[];
  availableSpecialties: string[];
  onToggleSpecialty: (specialty: string) => void;
  onToggleRegion: (region: string) => void;
  onClearAll: () => void;
};

const DEFAULT_SPECIALTIES = ['MCL', '移植', '悪性リンパ腫', 'DLBCL', 'FL', 'AML', 'ALL', 'CML'];
const REGIONS = ['北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州'];

export default function FilterBar({
  activeSpecialties,
  activeRegions,
  availableSpecialties,
  onToggleSpecialty,
  onToggleRegion,
  onClearAll,
}: FilterBarProps) {
  const [customSpecialty, setCustomSpecialty] = useState('');
  const hasActiveFilters = activeSpecialties.length > 0 || activeRegions.length > 0;

  const allSpecialties = Array.from(new Set([...DEFAULT_SPECIALTIES, ...availableSpecialties]));

  const handleAddCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      onToggleSpecialty(customSpecialty.trim());
      setCustomSpecialty('');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">専門領域</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-clear-filters"
          >
            すべてクリア
          </button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={customSpecialty}
          onChange={(e) => setCustomSpecialty(e.target.value)}
          placeholder="カスタム専門領域"
          className="flex-1 h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomSpecialty();
            }
          }}
          data-testid="input-custom-specialty"
        />
        <Button
          size="sm"
          onClick={handleAddCustomSpecialty}
          className="h-8"
          data-testid="button-add-specialty"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {allSpecialties.map((specialty) => {
          const isActive = activeSpecialties.includes(specialty);
          return (
            <Badge
              key={specialty}
              variant={isActive ? 'default' : 'outline'}
              className="cursor-pointer transition-all"
              onClick={() => onToggleSpecialty(specialty)}
              data-testid={`filter-specialty-${specialty}`}
            >
              {specialty}
              {isActive && <X className="w-3 h-3 ml-1" />}
            </Badge>
          );
        })}
      </div>

      <h3 className="text-sm font-medium text-foreground mt-2">地域</h3>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((region) => {
          const isActive = activeRegions.includes(region);
          return (
            <Badge
              key={region}
              variant={isActive ? 'default' : 'outline'}
              className="cursor-pointer transition-all"
              onClick={() => onToggleRegion(region)}
              data-testid={`filter-region-${region}`}
            >
              {region}
              {isActive && <X className="w-3 h-3 ml-1" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
