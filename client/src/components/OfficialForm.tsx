import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  nodeId: z.string().min(1, '人物を選択してください'),
  position: z.string().min(1, '役職を入力してください'),
  term: z.string().optional(),
  institution: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Node = {
  id: string;
  name: string;
  facility?: string;
};

type OfficialFormProps = {
  initialData?: FormData & { id?: string };
  onSubmit: (data: FormData & { id?: string }) => void;
  onCancel?: () => void;
};

export default function OfficialForm({ initialData, onSubmit, onCancel }: OfficialFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nodeId: '',
      position: '',
      term: '',
      institution: '',
    },
  });

  const { data: nodes = [] } = useQuery<Node[]>({
    queryKey: ['/api/nodes'],
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
        <Label htmlFor="nodeId">人物 *</Label>
        <Select
          value={form.watch('nodeId')}
          onValueChange={(value) => form.setValue('nodeId', value)}
        >
          <SelectTrigger id="nodeId" data-testid="select-official-node">
            <SelectValue placeholder="人物を選択" />
          </SelectTrigger>
          <SelectContent>
            {nodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.name} {node.facility && `(${node.facility})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.nodeId && (
          <p className="text-sm text-destructive">{form.formState.errors.nodeId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">役職 *</Label>
        <Input
          id="position"
          {...form.register('position')}
          placeholder="例: 理事長"
          data-testid="input-official-position"
        />
        {form.formState.errors.position && (
          <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="term">任期</Label>
        <Input
          id="term"
          {...form.register('term')}
          placeholder="例: 2023年-2025年"
          data-testid="input-official-term"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution">就任機関</Label>
        <Input
          id="institution"
          {...form.register('institution')}
          placeholder="例: 東京大学医学部"
          data-testid="input-official-institution"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-official">
            キャンセル
          </Button>
        )}
        <Button type="submit" data-testid="button-submit-official">
          {initialData?.id ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  );
}
