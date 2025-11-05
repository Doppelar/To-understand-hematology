import CustomNode from '../CustomNode';
import { ReactFlowProvider, NodeProps } from 'reactflow';
import { CustomNodeData } from '../CustomNode';
import 'reactflow/dist/style.css';

export default function CustomNodeExample() {
  const nodeProps: NodeProps<CustomNodeData> = {
    id: '1',
    type: 'custom',
    data: {
      name: '田中太郎',
      facilityName: '東京大学病院',
      specialty: '循環器',
      region: '東京',
      photoUrl: '',
      showLabels: true,
    },
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    dragging: false,
  };

  return (
    <ReactFlowProvider>
      <div className="flex items-center justify-center p-8 bg-background">
        <CustomNode {...nodeProps} />
      </div>
    </ReactFlowProvider>
  );
}
