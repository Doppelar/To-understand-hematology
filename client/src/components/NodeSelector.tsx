import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check } from 'lucide-react';
import type { Node } from '@shared/schema';

interface NodeSelectorProps {
  selectedNodeIds: string[];
  onSelectNode: (nodeId: string) => void;
}

export default function NodeSelector({ selectedNodeIds, onSelectNode }: NodeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: nodes = [], isLoading } = useQuery<Node[]>({
    queryKey: ['/api/nodes'],
  });

  const filteredNodes = nodes.filter((node) => {
    const query = searchQuery.toLowerCase();
    return (
      node.name.toLowerCase().includes(query) ||
      (node.facilityName && node.facilityName.toLowerCase().includes(query)) ||
      (node.position && node.position.toLowerCase().includes(query)) ||
      (node.specialty && node.specialty.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="名前、施設、役職、専門で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-directory"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
      ) : filteredNodes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? '該当する人物が見つかりません' : '名鑑に人物が登録されていません'}
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-4">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeIds.includes(node.id);
              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover-elevate ${
                    isSelected ? 'bg-primary/10 border-primary' : 'bg-card'
                  }`}
                  onClick={() => onSelectNode(node.id)}
                  data-testid={`node-item-${node.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={node.photoUrl || undefined} />
                      <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{node.name}</h4>
                          {node.facilityName && (
                            <p className="text-sm text-muted-foreground truncate">
                              {node.facilityName}
                            </p>
                          )}
                          {node.position && (
                            <p className="text-sm text-muted-foreground truncate">{node.position}</p>
                          )}
                        </div>
                        {isSelected ? (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      {(node.specialty || node.region) && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {node.specialty && (
                            <Badge variant="secondary" className="text-xs">
                              {node.specialty}
                            </Badge>
                          )}
                          {node.region && (
                            <Badge variant="outline" className="text-xs">
                              {node.region}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {selectedNodeIds.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedNodeIds.length}人がマップに表示されています
          </p>
        </div>
      )}
    </div>
  );
}
