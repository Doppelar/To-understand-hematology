import { useState } from 'react';
import { ReactFlowProvider, Node, Edge } from 'reactflow';
import NetworkCanvas from '../NetworkCanvas';
import { CustomNodeData } from '../CustomNode';
import 'reactflow/dist/style.css';

export default function NetworkCanvasExample() {
  const [showLabels, setShowLabels] = useState(true);

  const initialNodes: Node<CustomNodeData>[] = [
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 100 },
      data: {
        name: '田中太郎',
        facilityName: '東京大学病院',
        specialty: '循環器',
        region: '関東',
        showLabels: true,
      },
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 100, y: 300 },
      data: {
        name: '佐藤花子',
        facilityName: '大阪市立病院',
        specialty: '呼吸器',
        region: '関西',
        showLabels: true,
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
  ];

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '600px' }}>
        <NetworkCanvas
          nodes={initialNodes}
          edges={initialEdges}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          onNodeClick={(node) => console.log('Node clicked:', node)}
          onConnect={(connection) => console.log('Connected:', connection)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
        />
      </div>
    </ReactFlowProvider>
  );
}
