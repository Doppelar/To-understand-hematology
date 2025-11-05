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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Trash2, ArrowRight, ArrowLeft, ArrowLeftRight, Minus } from 'lucide-react';

const formSchema = z.object({
  label: z.string().optional(),
  direction: z.enum(['forward', 'backward', 'both', 'none']).default('forward'),
});

type FormData = z.infer<typeof formSchema>;

interface EdgeLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edge: {
    id: string;
    label?: string;
    direction?: string;
    sourceId: string;
    targetId: string;
  } | null;
  onSave: (data: { id: string; label?: string; direction?: string }) => void;
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
      direction: 'forward',
    },
  });

  useEffect(() => {
    if (edge) {
      form.reset({
        label: edge.label || '',
        direction: (edge.direction || 'forward') as 'forward' | 'backward' | 'both' | 'none',
      });
    }
  }, [edge, form]);

  const handleSubmit = (data: FormData) => {
    if (edge) {
      onSave({ id: edge.id, label: data.label, direction: data.direction });
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

          <div className="space-y-2">
            <Label htmlFor="edge-direction">方向性</Label>
            <Select
              value={form.watch('direction')}
              onValueChange={(value) => form.setValue('direction', value as 'forward' | 'backward' | 'both' | 'none')}
            >
              <SelectTrigger id="edge-direction" data-testid="select-edge-direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forward">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>片方向（→）</span>
                  </div>
                </SelectItem>
                <SelectItem value="backward">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>逆方向（←）</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>両方向（↔）</span>
                  </div>
                </SelectItem>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4" />
                    <span>方向なし（—）</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              関係性の向きを選択してください
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
