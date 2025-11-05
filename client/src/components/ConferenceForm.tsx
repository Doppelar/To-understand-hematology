import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  year: z.string().min(1, '年度を入力してください'),
  number: z.string().optional(),
  title: z.string().min(1, 'タイトルを入力してください'),
  theme: z.string().optional(),
  location: z.string().optional(),
  president: z.string().optional(),
  date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type ConferenceFormProps = {
  initialData?: FormData & { id?: string };
  onSubmit: (data: FormData & { id?: string }) => void;
  onCancel?: () => void;
};

export default function ConferenceForm({ initialData, onSubmit, onCancel }: ConferenceFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      year: '',
      number: '',
      title: '',
      theme: '',
      location: '',
      president: '',
      date: '',
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      id: initialData?.id,
    });
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">年度 *</Label>
          <Input
            id="year"
            {...form.register('year')}
            placeholder="例: 2024"
            data-testid="input-conference-year"
          />
          {form.formState.errors.year && (
            <p className="text-sm text-destructive">{form.formState.errors.year.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">回数</Label>
          <Input
            id="number"
            {...form.register('number')}
            placeholder="例: 第86回"
            data-testid="input-conference-number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="例: 日本血液学会学術集会"
          data-testid="input-conference-title"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">テーマ</Label>
        <Input
          id="theme"
          {...form.register('theme')}
          placeholder="例: 血液疾患の新しい治療法"
          data-testid="input-conference-theme"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">開催地</Label>
          <Input
            id="location"
            {...form.register('location')}
            placeholder="例: 東京"
            data-testid="input-conference-location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="president">会長</Label>
          <Input
            id="president"
            {...form.register('president')}
            placeholder="例: 田中太郎"
            data-testid="input-conference-president"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">日程</Label>
        <Input
          id="date"
          {...form.register('date')}
          placeholder="例: 2024年10月11日-13日"
          data-testid="input-conference-date"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-conference">
            キャンセル
          </Button>
        )}
        <Button type="submit" data-testid="button-submit-conference">
          {initialData?.id ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  );
}
