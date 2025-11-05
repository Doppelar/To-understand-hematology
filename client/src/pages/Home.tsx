import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ReactFlowProvider, Node, Edge, Connection, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import NetworkCanvas from '@/components/NetworkCanvas';
import NodeSelector from '@/components/NodeSelector';
import EditNodeDialog from '@/components/EditNodeDialog';
import FilterBar from '@/components/FilterBar';
import { CustomNodeData } from '@/components/CustomNode';
import { Button } from '@/components/ui/button';
import { Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Node as DBNode, Edge as DBEdge } from '@shared/schema';

export default function Home() {
  const { toast } = useToast();
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [activeSpecialties, setActiveSpecialties] = useState<string[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);

  const { data: dbNodes = [] } = useQuery<DBNode[]>({
    queryKey: ['/api/nodes'],
  });

  const { data: dbEdges = [] } = useQuery<DBEdge[]>({
    queryKey: ['/api/edges'],
  });

  const updateNodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DBNode> }) => {
      return apiRequest(`/api/nodes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nodes'] });
    },
  });

  const createEdgeMutation = useMutation({
    mutationFn: async (data: { sourceId: string; targetId: string }) => {
      return apiRequest('/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/edges'] });
      toast({
        title: '関係性を追加しました',
      });
    },
  });

  const deleteEdgeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/edges/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/edges'] });
    },
  });

  const nodes = useMemo<Node<CustomNodeData>[]>(() => {
    return dbNodes
      .filter((dbNode) => selectedNodeIds.includes(dbNode.id))
      .map((dbNode) => ({
        id: dbNode.id,
        type: 'custom',
        position: {
          x: parseFloat(dbNode.positionX) || Math.random() * 400,
          y: parseFloat(dbNode.positionY) || Math.random() * 400,
        },
        data: {
          name: dbNode.name,
          facilityName: dbNode.facilityName || undefined,
          position: dbNode.position || undefined,
          specialty: dbNode.specialty || undefined,
          region: dbNode.region || undefined,
          photoUrl: dbNode.photoUrl || undefined,
          showLabels: true,
        },
      }));
  }, [dbNodes, selectedNodeIds]);

  const edges = useMemo<Edge[]>(() => {
    return dbEdges
      .filter((dbEdge) =>
        selectedNodeIds.includes(dbEdge.sourceId) &&
        selectedNodeIds.includes(dbEdge.targetId)
      )
      .map((dbEdge) => ({
        id: dbEdge.id,
        source: dbEdge.sourceId,
        target: dbEdge.targetId,
        label: dbEdge.label || undefined,
        animated: true,
      }));
  }, [dbEdges, selectedNodeIds]);

  const availableSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    nodes.forEach((node) => {
      if (node.data.specialty) {
        specialties.add(node.data.specialty);
      }
    });
    return Array.from(specialties);
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    if (activeSpecialties.length === 0 && activeRegions.length === 0) {
      return nodes;
    }

    return nodes.filter((node) => {
      const matchesSpecialty =
        activeSpecialties.length === 0 ||
        (node.data.specialty && activeSpecialties.includes(node.data.specialty));
      const matchesRegion =
        activeRegions.length === 0 ||
        (node.data.region && activeRegions.includes(node.data.region));
      return matchesSpecialty && matchesRegion;
    });
  }, [nodes, activeSpecialties, activeRegions]);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  const handleNodeClick = useCallback(
    (node: Node<CustomNodeData>) => {
      const dbNode = dbNodes.find((n) => n.id === node.id);
      if (dbNode) {
        setSelectedNode(node);
        setEditDialogOpen(true);
      }
    },
    [dbNodes]
  );

  const handleSaveNode = useCallback(
    (data: any) => {
      updateNodeMutation.mutate({ id: data.id, data });
      setEditDialogOpen(false);
    },
    [updateNodeMutation]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setSelectedNodeIds((prev) => prev.filter((nodeId) => nodeId !== id));
      setEditDialogOpen(false);
    },
    []
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        createEdgeMutation.mutate({
          sourceId: connection.source,
          targetId: connection.target,
        });
      }
    },
    [createEdgeMutation]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      
      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false && change.position) {
          updateNodeMutation.mutate({
            id: change.id,
            data: {
              positionX: change.position.x.toString(),
              positionY: change.position.y.toString(),
            },
          });
        }
      });

      return updatedNodes;
    },
    [nodes, updateNodeMutation]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdgeMutation.mutate(change.id);
        }
      });

      return applyEdgeChanges(changes, edges);
    },
    [edges, deleteEdgeMutation]
  );

  const handleToggleSpecialty = useCallback((specialty: string) => {
    setActiveSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  }, []);

  const handleToggleRegion = useCallback((region: string) => {
    setActiveRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveSpecialties([]);
    setActiveRegions([]);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="flex h-full w-full overflow-hidden">
        <aside className="w-80 border-r border-border bg-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">インフルエンサーマップ</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <Accordion type="multiple" defaultValue={['select', 'filter']} className="space-y-2">
              <AccordionItem value="select">
                <AccordionTrigger className="text-base font-medium">
                  名鑑から選択
                </AccordionTrigger>
                <AccordionContent>
                  <NodeSelector
                    selectedNodeIds={selectedNodeIds}
                    onSelectNode={handleSelectNode}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="filter">
                <AccordionTrigger className="text-base font-medium">
                  フィルター
                </AccordionTrigger>
                <AccordionContent>
                  <FilterBar
                    activeSpecialties={activeSpecialties}
                    activeRegions={activeRegions}
                    availableSpecialties={availableSpecialties}
                    onToggleSpecialty={handleToggleSpecialty}
                    onToggleRegion={handleToggleRegion}
                    onClearAll={handleClearFilters}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <NetworkCanvas
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeClick={handleNodeClick}
              onConnect={handleConnect}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
            />
          </div>
        </main>

        <EditNodeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          node={
            selectedNode
              ? {
                  id: selectedNode.id,
                  name: selectedNode.data.name,
                  facilityName: selectedNode.data.facilityName,
                  position: selectedNode.data.position,
                  specialty: selectedNode.data.specialty,
                  region: selectedNode.data.region,
                  photoUrl: selectedNode.data.photoUrl,
                }
              : null
          }
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
        />
      </div>
    </ReactFlowProvider>
  );
}
