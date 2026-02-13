import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Upload, Plus, ImagePlus } from 'lucide-react';
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

type AddNodeFormProps = {
  onSubmit: (data: FormData & { photoUrl?: string }) => void;
};

export default function AddNodeForm({ onSubmit }: AddNodeFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>();
  
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
      setPhotoUrl(objectPath);
    } catch (error) {
      console.error('Photo URL normalization error:', error);
    }
  };

  const handleSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      facilityUrl: data.facilityUrl || undefined,
      photoUrl,
    };
    onSubmit(submitData);
    form.reset();
    setPhotoUrl(undefined);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="photo">写真</Label>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={photoUrl} />
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
        <Label htmlFor="name">氏名 *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="例: 田中太郎"
          data-testid="input-name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">地域</Label>
        <Select
          onValueChange={(value) => {
            form.setValue('region', value);
          }}
          defaultValue={form.watch('region')}
        >
          <SelectTrigger data-testid="select-region">
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
            <SelectItem value="海外">海外</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="facilityName">施設名</Label>
        <Input
          id="facilityName"
          {...form.register('facilityName')}
          placeholder="例: 東京大学、がん研有明病院、国立がん研究センターなど"
          list="facility-suggestions"
          data-testid="input-facility"
        />
        {selectedRegion && availableUniversities.length > 0 && (
          <datalist id="facility-suggestions">
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
        <Label htmlFor="facilityUrl">施設HP URL</Label>
        <Input
          id="facilityUrl"
          {...form.register('facilityUrl')}
          placeholder="例: https://www.hospital.ac.jp/"
          type="url"
          data-testid="input-facility-url"
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
          <Label htmlFor="graduationUniversity">出身大学</Label>
          <Input
            id="graduationUniversity"
            {...form.register('graduationUniversity')}
            placeholder="例: 東京大学"
            data-testid="input-graduation-university"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="graduationYear">卒年</Label>
          <Input
            id="graduationYear"
            {...form.register('graduationYear')}
            placeholder="例: 1990年"
            data-testid="input-graduation-year"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">役職</Label>
        <Input
          id="position"
          {...form.register('position')}
          placeholder="例: 教授、准教授、講師など"
          list="position-suggestions"
          data-testid="input-position"
        />
        <datalist id="position-suggestions">
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
          <Label htmlFor="appointmentDate">就任日</Label>
          <Input
            id="appointmentDate"
            {...form.register('appointmentDate')}
            placeholder="例: 2020年4月"
            data-testid="input-appointment-date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retirementDate">退官日</Label>
          <Input
            id="retirementDate"
            {...form.register('retirementDate')}
            placeholder="例: 2025年3月"
            data-testid="input-retirement-date"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">専門領域</Label>
        <Input
          id="specialty"
          {...form.register('specialty')}
          placeholder="例: MCL、移植、悪性リンパ腫など"
          list="specialty-suggestions"
          data-testid="input-specialty"
        />
        <datalist id="specialty-suggestions">
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
        <Label htmlFor="career">経歴</Label>
        <Textarea
          id="career"
          {...form.register('career')}
          placeholder="経歴や関係性について記入してください"
          className="resize-none h-24"
          data-testid="textarea-career"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dlbclTreatment">治療方針 DLBCL</Label>
        <Textarea
          id="dlbclTreatment"
          {...form.register('dlbclTreatment')}
          placeholder="DLBCL（びまん性大細胞型B細胞リンパ腫）の治療方針について記入してください"
          className="resize-none h-24"
          data-testid="textarea-dlbcl-treatment"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="flTreatment">治療方針 FL</Label>
        <Textarea
          id="flTreatment"
          {...form.register('flTreatment')}
          placeholder="FL（濾胞性リンパ腫）の治療方針について記入してください"
          className="resize-none h-24"
          data-testid="textarea-fl-treatment"
        />
      </div>

      <Button type="submit" className="w-full" data-testid="button-add-node">
        <Plus className="w-4 h-4 mr-2" />
        ノードを追加
      </Button>
    </form>
  );
}
