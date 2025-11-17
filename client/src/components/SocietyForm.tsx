import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, '学会名を入力してください'),
  shortName: z.string().min(1, '略称を入力してください'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type SocietyFormProps = {
  initialData?: FormData & { id?: string };
  onSubmit: (data: FormData & { id?: string }) => void;
  onCancel?: () => void;
};

export default function SocietyForm({ initialData, onSubmit, onCancel }: SocietyFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      shortName: '',
      description: '',
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
      <div className="space-y-2">
        <Label htmlFor="name">学会名 *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="例: American Society of Hematology"
          data-testid="input-society-name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortName">略称 *</Label>
        <Input
          id="shortName"
          {...form.register('shortName')}
          placeholder="例: ASH"
          data-testid="input-society-short-name"
        />
        {form.formState.errors.shortName && (
          <p className="text-sm text-destructive">{form.formState.errors.shortName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="例: 米国の血液学会で、世界最大規模の血液学の学術集会を主催しています"
          className="resize-none"
          rows={3}
          data-testid="input-society-description"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-society">
            キャンセル
          </Button>
        )}
        <Button type="submit" data-testid="button-submit-society">
          {initialData?.id ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  );
}
