import { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  ConnectionMode,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode, { CustomNodeData } from './CustomNode';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Save, PanelLeftClose, PanelLeft } from 'lucide-react';

type NetworkCanvasProps = {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => Node<CustomNodeData>[];
  onEdgesChange: (changes: EdgeChange[]) => Edge[];
  onNodeClick: (node: Node<CustomNodeData>) => void;
  onEdgeClick?: (edgeId: string) => void;
  onConnect: (connection: Connection) => void;
  onSave?: () => void;
  onToggleSidebar?: () => void;
  sidebarVisible?: boolean;
  showLabels: boolean;
  onToggleLabels: () => void;
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function NetworkCanvas({
  nodes: propNodes,
  edges: propEdges,
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onNodeClick,
  onEdgeClick,
  onConnect,
  onSave,
  onToggleSidebar,
  sidebarVisible = true,
  showLabels,
  onToggleLabels,
}: NetworkCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(propNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(propEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  useEffect(() => {
    setNodes(propNodes);
  }, [propNodes, setNodes]);

  useEffect(() => {
    setEdges(propEdges);
  }, [propEdges, setEdges]);

  const nodesWithLabels = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        showLabels,
      },
    }));
  }, [nodes, showLabels]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      const updatedNodes = onNodesChangeProp(changes);
      setNodes(updatedNodes);
    },
    [onNodesChangeProp, onNodesChangeInternal, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      const updatedEdges = onEdgesChangeProp(changes);
      setEdges(updatedEdges);
    },
    [onEdgesChangeProp, onEdgesChangeInternal, setEdges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      onConnect(connection);
    },
    [setEdges, onConnect]
  );

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodesWithLabels}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onNodeClick(node as Node<CustomNodeData>)}
        onEdgeClick={(_, edge) => onEdgeClick?.(edge.id)}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background className="bg-muted/30" />
        <Controls className="!bg-card !border-border" />
      </ReactFlow>

      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {onToggleSidebar && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
            data-testid="button-toggle-map-sidebar"
            title={sidebarVisible ? 'フィルターサイドバーを隠す' : 'フィルターサイドバーを表示'}
          >
            {sidebarVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
        )}
        {onSave && (
          <Button
            variant="default"
            onClick={onSave}
            data-testid="button-save-map"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFitView}
          data-testid="button-fit-view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleLabels}
          data-testid="button-toggle-labels"
        >
          {showLabels ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">名鑑から人物を選択してマップを開始</p>
            <p className="text-sm mt-2">左側の「名鑑から選択」で人物を追加できます</p>
          </div>
        </div>
      )}
    </div>
  );
}
