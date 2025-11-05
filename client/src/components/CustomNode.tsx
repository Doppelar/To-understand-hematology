import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export type CustomNodeData = {
  name: string;
  facilityName?: string;
  position?: string;
  specialty?: string;
  region?: string;
  photoUrl?: string;
  showLabels?: boolean;
};

function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const { name, facilityName, position, specialty, region, photoUrl, showLabels = true } = data;

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      
      <div className={`flex flex-col items-center gap-2 transition-all ${selected ? 'scale-110' : ''}`}>
        <div className={`relative ${selected ? 'ring-4 ring-primary rounded-full' : ''}`}>
          <Avatar className="w-20 h-20 border-2 border-border hover-elevate">
            <AvatarImage src={photoUrl} alt={name} className="object-cover" />
            <AvatarFallback className="text-lg font-medium">
              {name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {showLabels && (
          <div className="flex flex-col items-center gap-1 max-w-24">
            <div className="text-sm font-medium text-center text-foreground truncate w-full">
              {name}
            </div>
            {facilityName && (
              <div className="text-xs text-muted-foreground text-center truncate w-full">
                {facilityName}
              </div>
            )}
            {position && (
              <div className="text-xs text-muted-foreground text-center truncate w-full">
                {position}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
}

export default memo(CustomNode);
