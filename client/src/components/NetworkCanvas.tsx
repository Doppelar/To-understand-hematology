import { useCallback, useState, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode, { CustomNodeData } from './CustomNode';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

type NetworkCanvasProps = {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  onNodesChange: (nodes: Node<CustomNodeData>[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeClick: (node: Node<CustomNodeData>) => void;
  onConnect: (connection: Connection) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function NetworkCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onConnect,
  showLabels,
  onToggleLabels,
}: NetworkCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
    (changes: any) => {
      onNodesChangeInternal(changes);
      const updatedNodes = nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change?.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal]
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
            <p className="text-lg font-medium">ノードを追加してマップを開始</p>
            <p className="text-sm mt-2">左側のフォームからノードを追加できます</p>
          </div>
        </div>
      )}
    </div>
  );
}
