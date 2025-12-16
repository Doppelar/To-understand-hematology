import { useEffect, useState, useMemo } from 'react';
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
import { Upload, Save, Trash2, ImagePlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MEDICAL_UNIVERSITIES } from '@shared/universities';
import { ObjectUploader } from '@/components/ObjectUploader';

const formSchema = z.object({
  name: z.string().min(1, '氏名を入力してください'),
  facilityName: z.string().optional(),
  facilityUrl: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  position: z.string().optional(),
  career: z.string().optional(),
  specialty: z.string().optional(),
  region: z.string().optional(),
  graduationUniversity: z.string().optional(),
  graduationYear: z.string().optional(),
  appointmentDate: z.string().optional(),
  retirementDate: z.string().optional(),
  dlbclTreatment: z.string().optional(),
  flTreatment: z.string().optional(),
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
      facilityUrl: '',
      position: '',
      career: '',
      specialty: '',
      region: '',
      graduationUniversity: '',
      graduationYear: '',
      appointmentDate: '',
      retirementDate: '',
      dlbclTreatment: '',
      flTreatment: '',
    },
  });

  useEffect(() => {
    if (node) {
      form.reset({
        name: node.name,
        facilityName: node.facilityName || '',
        facilityUrl: (node as any).facilityUrl || '',
        position: node.position || '',
        career: node.career || '',
        specialty: node.specialty || '',
        region: node.region || '',
        graduationUniversity: (node as any).graduationUniversity || '',
        graduationYear: (node as any).graduationYear || '',
        appointmentDate: (node as any).appointmentDate || '',
        retirementDate: (node as any).retirementDate || '',
        dlbclTreatment: (node as any).dlbclTreatment || '',
        flTreatment: (node as any).flTreatment || '',
      });
      setPhotoPreview(node.photoUrl);
    }
  }, [node, form]);

  const selectedRegion = form.watch('region');
  const availableUniversities = useMemo(() => {
    if (!selectedRegion) return [];
    return MEDICAL_UNIVERSITIES[selectedRegion] || [];
  }, [selectedRegion]);

  const handleUploadComplete = async (uploadedURL: string) => {
    try {
      const response = await fetch('/api/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoURL: uploadedURL }),
      });
      if (!response.ok) {
        throw new Error('Failed to normalize photo URL');
      }
      const { objectPath } = await response.json();
      setPhotoPreview(objectPath);
    } catch (error) {
      console.error('Photo URL normalization error:', error);
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
              <ObjectUploader
                maxFileSize={10485760}
                onComplete={handleUploadComplete}
                buttonClassName="flex-1"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                写真をアップロード
              </ObjectUploader>
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
            <Label htmlFor="edit-region">地域</Label>
            <Select
              onValueChange={(value) => {
                form.setValue('region', value);
              }}
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
            <Label htmlFor="edit-facilityName">施設名</Label>
            <Input
              id="edit-facilityName"
              {...form.register('facilityName')}
              placeholder="例: 東京大学、がん研有明病院、国立がん研究センターなど"
              list="edit-facility-suggestions"
              data-testid="input-edit-facility"
            />
            {selectedRegion && availableUniversities.length > 0 && (
              <datalist id="edit-facility-suggestions">
                {availableUniversities.map((university) => (
                  <option key={university} value={university} />
                ))}
              </datalist>
            )}
            <p className="text-xs text-muted-foreground">
              大学、病院、クリニック、研究所など、任意の施設名を入力できます。地域を選択すると大学の候補が表示されます。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-facilityUrl">施設HP URL</Label>
            <Input
              id="edit-facilityUrl"
              {...form.register('facilityUrl')}
              placeholder="例: https://www.hospital.ac.jp/"
              type="url"
              data-testid="input-edit-facility-url"
            />
            {form.formState.errors.facilityUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.facilityUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              施設のホームページURLを入力すると、名鑑からリンクできます
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-graduationUniversity">出身大学</Label>
              <Input
                id="edit-graduationUniversity"
                {...form.register('graduationUniversity')}
                placeholder="例: 東京大学"
                data-testid="input-edit-graduation-university"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-graduationYear">卒年</Label>
              <Input
                id="edit-graduationYear"
                {...form.register('graduationYear')}
                placeholder="例: 1990年"
                data-testid="input-edit-graduation-year"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-position">役職</Label>
            <Input
              id="edit-position"
              {...form.register('position')}
              placeholder="例: 教授、准教授、講師など"
              list="edit-position-suggestions"
              data-testid="input-edit-position"
            />
            <datalist id="edit-position-suggestions">
              <option value="教授" />
              <option value="准教授" />
              <option value="講師" />
              <option value="助教" />
              <option value="特任教授" />
              <option value="客員教授" />
              <option value="名誉教授" />
              <option value="診療科長" />
              <option value="部長" />
              <option value="医長" />
            </datalist>
            <p className="text-xs text-muted-foreground">
              既存の選択肢から選ぶか、新しい役職を入力できます
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-appointmentDate">就任日</Label>
              <Input
                id="edit-appointmentDate"
                {...form.register('appointmentDate')}
                placeholder="例: 2020年4月"
                data-testid="input-edit-appointment-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-retirementDate">退官日</Label>
              <Input
                id="edit-retirementDate"
                {...form.register('retirementDate')}
                placeholder="例: 2025年3月"
                data-testid="input-edit-retirement-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-specialty">専門領域</Label>
            <Input
              id="edit-specialty"
              {...form.register('specialty')}
              placeholder="例: MCL、移植、悪性リンパ腫など"
              list="edit-specialty-suggestions"
              data-testid="input-edit-specialty"
            />
            <datalist id="edit-specialty-suggestions">
              <option value="MCL" />
              <option value="移植" />
              <option value="悪性リンパ腫" />
              <option value="DLBCL" />
              <option value="FL" />
              <option value="AML" />
              <option value="ALL" />
              <option value="CML" />
            </datalist>
            <p className="text-xs text-muted-foreground">
              既存の選択肢から選ぶか、新しい専門領域を入力できます
            </p>
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

          <div className="space-y-2">
            <Label htmlFor="edit-dlbclTreatment">治療方針 DLBCL</Label>
            <Textarea
              id="edit-dlbclTreatment"
              {...form.register('dlbclTreatment')}
              placeholder="DLBCL（びまん性大細胞型B細胞リンパ腫）の治療方針について記入してください"
              className="resize-none h-24"
              data-testid="textarea-edit-dlbcl-treatment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-flTreatment">治療方針 FL</Label>
            <Textarea
              id="edit-flTreatment"
              {...form.register('flTreatment')}
              placeholder="FL（濾胞性リンパ腫）の治療方針について記入してください"
              className="resize-none h-24"
              data-testid="textarea-edit-fl-treatment"
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
