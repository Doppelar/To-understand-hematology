import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

type FilterBarProps = {
  activeSpecialties: string[];
  activeRegions: string[];
  onToggleSpecialty: (specialty: string) => void;
  onToggleRegion: (region: string) => void;
  onClearAll: () => void;
};

const SPECIALTIES = ['循環器', '呼吸器', '消化器', '神経内科', '小児科', '外科'];
const REGIONS = ['北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州'];

export default function FilterBar({
  activeSpecialties,
  activeRegions,
  onToggleSpecialty,
  onToggleRegion,
  onClearAll,
}: FilterBarProps) {
  const hasActiveFilters = activeSpecialties.length > 0 || activeRegions.length > 0;

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
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map((specialty) => {
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
