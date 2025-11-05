import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Save, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const formSchema = z.object({
  name: z.string().min(1, '氏名を入力してください'),
  facilityName: z.string().optional(),
  career: z.string().optional(),
  specialty: z.string().optional(),
  region: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type NodeData = FormData & {
  id: string;
  photoUrl?: string;
};

type EditNodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: NodeData | null;
  onSave: (data: NodeData) => void;
  onDelete: (id: string) => void;
};

export default function EditNodeDialog({
  open,
  onOpenChange,
  node,
  onSave,
  onDelete,
}: EditNodeDialogProps) {
  const [photoPreview, setPhotoPreview] = useState<string>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      facilityName: '',
      career: '',
      specialty: '',
      region: '',
    },
  });

  useEffect(() => {
    if (node) {
      form.reset({
        name: node.name,
        facilityName: node.facilityName || '',
        career: node.career || '',
        specialty: node.specialty || '',
        region: node.region || '',
      });
      setPhotoPreview(node.photoUrl);
    }
  }, [node, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: FormData) => {
    if (node) {
      onSave({ ...data, id: node.id, photoUrl: photoPreview });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (node) {
      onDelete(node.id);
      onOpenChange(false);
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ノードを編集</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-photo">写真</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={photoPreview} />
                <AvatarFallback>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  id="edit-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                  data-testid="input-edit-photo"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">氏名 *</Label>
            <Input
              id="edit-name"
              {...form.register('name')}
              placeholder="例: 田中太郎"
              data-testid="input-edit-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-facilityName">施設名</Label>
            <Input
              id="edit-facilityName"
              {...form.register('facilityName')}
              placeholder="例: 東京大学病院"
              data-testid="input-edit-facility"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-specialty">専門領域</Label>
            <Select
              onValueChange={(value) => form.setValue('specialty', value)}
              value={form.watch('specialty')}
            >
              <SelectTrigger data-testid="select-edit-specialty">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCL">MCL</SelectItem>
                <SelectItem value="移植">移植</SelectItem>
                <SelectItem value="悪性リンパ腫">悪性リンパ腫</SelectItem>
                <SelectItem value="DLBCL">DLBCL</SelectItem>
                <SelectItem value="FL">FL</SelectItem>
                <SelectItem value="AML">AML</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="CML">CML</SelectItem>
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-region">地域</Label>
            <Select
              onValueChange={(value) => form.setValue('region', value)}
              value={form.watch('region')}
            >
              <SelectTrigger data-testid="select-edit-region">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="北海道">北海道</SelectItem>
                <SelectItem value="東北">東北</SelectItem>
                <SelectItem value="関東">関東</SelectItem>
                <SelectItem value="中部">中部</SelectItem>
                <SelectItem value="関西">関西</SelectItem>
                <SelectItem value="中国">中国</SelectItem>
                <SelectItem value="四国">四国</SelectItem>
                <SelectItem value="九州">九州</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-career">経歴</Label>
            <Textarea
              id="edit-career"
              {...form.register('career')}
              placeholder="経歴や関係性について記入してください"
              className="resize-none h-24"
              data-testid="textarea-edit-career"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              data-testid="button-delete-node"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              削除
            </Button>
            <Button type="submit" data-testid="button-save-node">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
