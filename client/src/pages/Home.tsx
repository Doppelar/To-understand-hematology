import { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider, Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import NetworkCanvas from '@/components/NetworkCanvas';
import AddNodeForm from '@/components/AddNodeForm';
import EditNodeDialog from '@/components/EditNodeDialog';
import FilterBar from '@/components/FilterBar';
import ThemeToggle from '@/components/ThemeToggle';
import { CustomNodeData } from '@/components/CustomNode';
import { Button } from '@/components/ui/button';
import { Upload, Network } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import businessPerson from '@assets/generated_images/Professional_Japanese_businessperson_portrait_f0615887.png';
import medicalProfessional from '@assets/generated_images/Japanese_medical_professional_portrait_c3b51456.png';
import researcher from '@assets/generated_images/Japanese_researcher_portrait_dcaf188f.png';

export default function Home() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 100 },
      data: {
        name: '田中太郎',
        facilityName: '東京大学病院',
        specialty: 'MCL',
        region: '関東',
        photoUrl: medicalProfessional,
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
        specialty: '移植',
        region: '関西',
        photoUrl: businessPerson,
        showLabels: true,
      },
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 400, y: 300 },
      data: {
        name: '鈴木一郎',
        facilityName: '名古屋大学',
        specialty: '悪性リンパ腫',
        region: '中部',
        photoUrl: researcher,
        showLabels: true,
      },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
  ]);

  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [activeSpecialties, setActiveSpecialties] = useState<string[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);

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

  const handleAddNode = useCallback((data: any) => {
    const newNode: Node<CustomNodeData> = {
      id: `${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        name: data.name,
        facilityName: data.facilityName,
        specialty: data.specialty,
        region: data.region,
        photoUrl: data.photoUrl,
        showLabels: true,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const handleNodeClick = useCallback((node: Node<CustomNodeData>) => {
    setSelectedNode(node);
    setEditDialogOpen(true);
  }, []);

  const handleSaveNode = useCallback((data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === data.id
          ? {
              ...node,
              data: {
                ...node.data,
                name: data.name,
                facilityName: data.facilityName,
                specialty: data.specialty,
                region: data.region,
                photoUrl: data.photoUrl,
              },
            }
          : node
      )
    );
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      animated: true,
    };
    setEdges((eds) => [...eds, newEdge]);
  }, []);

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
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="w-80 border-r border-border bg-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">インフルエンサーマップ</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <Accordion type="multiple" defaultValue={['add', 'filter']} className="space-y-2">
              <AccordionItem value="add">
                <AccordionTrigger className="text-base font-medium">
                  ノードを追加
                </AccordionTrigger>
                <AccordionContent>
                  <AddNodeForm onSubmit={handleAddNode} />
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
                    onToggleSpecialty={handleToggleSpecialty}
                    onToggleRegion={handleToggleRegion}
                    onClearAll={handleClearFilters}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="upload">
                <AccordionTrigger className="text-base font-medium">
                  ドキュメントアップロード
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      委員会リストやガイドラインをアップロードして、自動的にマップを生成できます。
                    </p>
                    <Button variant="outline" className="w-full" disabled data-testid="button-upload-document">
                      <Upload className="w-4 h-4 mr-2" />
                      ファイルを選択（準備中）
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-foreground">
                ネットワークビュー
              </h2>
              <span className="text-sm text-muted-foreground">
                ({filteredNodes.length} / {nodes.length} ノード表示中)
              </span>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 overflow-hidden">
            <NetworkCanvas
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
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
