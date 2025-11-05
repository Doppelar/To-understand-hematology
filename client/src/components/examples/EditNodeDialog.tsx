import { useState } from 'react';
import EditNodeDialog from '../EditNodeDialog';
import { Button } from '@/components/ui/button';

export default function EditNodeDialogExample() {
  const [open, setOpen] = useState(false);

  const mockNode = {
    id: '1',
    name: '田中太郎',
    facilityName: '東京大学病院',
    specialty: '循環器',
    region: '関東',
    career: '東京大学医学部卒業後、同大学院にて研究を続け、現在は循環器科の主任として活躍中。',
    photoUrl: '',
  };

  const handleSave = (data: any) => {
    console.log('Node updated:', data);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    console.log('Node deleted:', id);
    setOpen(false);
  };

  return (
    <div className="p-4 bg-background">
      <Button onClick={() => setOpen(true)}>編集ダイアログを開く</Button>
      <EditNodeDialog
        open={open}
        onOpenChange={setOpen}
        node={mockNode}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
