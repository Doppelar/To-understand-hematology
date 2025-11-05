import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Trash2 } from 'lucide-react';

const formSchema = z.object({
  label: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EdgeLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edge: {
    id: string;
    label?: string;
    sourceId: string;
    targetId: string;
  } | null;
  onSave: (data: { id: string; label?: string }) => void;
  onDelete: (id: string) => void;
}

export default function EdgeLabelDialog({
  open,
  onOpenChange,
  edge,
  onSave,
  onDelete,
}: EdgeLabelDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
    },
  });

  useEffect(() => {
    if (edge) {
      form.reset({
        label: edge.label || '',
      });
    }
  }, [edge, form]);

  const handleSubmit = (data: FormData) => {
    if (edge) {
      onSave({ id: edge.id, label: data.label });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (edge) {
      onDelete(edge.id);
      onOpenChange(false);
    }
  };

  if (!edge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>関係性を編集</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edge-label">関係性の説明</Label>
            <Input
              id="edge-label"
              {...form.register('label')}
              placeholder="例: 師弟関係、共同研究者、同期など"
              data-testid="input-edge-label"
            />
            <p className="text-xs text-muted-foreground">
              この2人の関係性を表すラベルを入力してください
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              data-testid="button-delete-edge"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              削除
            </Button>
            <Button type="submit" data-testid="button-save-edge">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
