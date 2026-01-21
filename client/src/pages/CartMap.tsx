import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2, ExternalLink, MapPin, Building2 } from 'lucide-react';
import type { CartFacility } from '@shared/schema';

const REGIONS = ['北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州'] as const;

const DRUG_CATEGORIES = {
  lymphoma: {
    label: '悪性リンパ腫',
    drugs: [
      { key: 'axicel', label: 'Axicel (イエスカルタ)' },
      { key: 'tisacel', label: 'Tisa-cel (キムリア)' },
      { key: 'lisocel', label: 'Liso-cel (ブレヤンジ)' },
    ],
  },
  bcma: {
    label: 'BCMA標的（多発性骨髄腫）',
    drugs: [
      { key: 'abecma', label: 'アベクマ (Abecma)' },
      { key: 'carvykti', label: 'カービクティ (Carvykti)' },
    ],
  },
};

type DrugKey = 'axicel' | 'tisacel' | 'lisocel' | 'abecma' | 'carvykti';

const REGION_POSITIONS: Record<string, { top: string; left: string }> = {
  '北海道': { top: '5%', left: '75%' },
  '東北': { top: '20%', left: '70%' },
  '関東': { top: '40%', left: '65%' },
  '中部': { top: '45%', left: '50%' },
  '関西': { top: '55%', left: '40%' },
  '中国': { top: '60%', left: '25%' },
  '四国': { top: '70%', left: '35%' },
  '九州': { top: '75%', left: '15%' },
};

const DRUG_COLORS: Record<DrugKey, string> = {
  axicel: 'bg-blue-500',
  tisacel: 'bg-green-500',
  lisocel: 'bg-purple-500',
  abecma: 'bg-orange-500',
  carvykti: 'bg-red-500',
};

const DRUG_LABELS: Record<DrugKey, string> = {
  axicel: 'Axicel',
  tisacel: 'Tisa-cel',
  lisocel: 'Liso-cel',
  abecma: 'アベクマ',
  carvykti: 'カービクティ',
};

export default function CartMap() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lymphoma' | 'bcma'>('all');
  const [selectedDrug, setSelectedDrug] = useState<DrugKey | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: facilities = [], isLoading } = useQuery<CartFacility[]>({
    queryKey: ['/api/cart-facilities'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cart-facilities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart-facilities'] });
    },
  });

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      if (selectedCategory === 'lymphoma') {
        const hasLymphomaDrug =
          facility.axicel === 'true' ||
          facility.tisacel === 'true' ||
          facility.lisocel === 'true';
        if (!hasLymphomaDrug) return false;
      } else if (selectedCategory === 'bcma') {
        const hasBcmaDrug =
          facility.abecma === 'true' || facility.carvykti === 'true';
        if (!hasBcmaDrug) return false;
      }

      if (selectedDrug !== 'all') {
        if (facility[selectedDrug] !== 'true') return false;
      }

      return true;
    });
  }, [facilities, selectedCategory, selectedDrug]);

  const facilitiesByRegion = useMemo(() => {
    const byRegion: Record<string, CartFacility[]> = {};
    REGIONS.forEach((region) => {
      byRegion[region] = filteredFacilities.filter((f) => f.region === region);
    });
    return byRegion;
  }, [filteredFacilities]);

  const getDrugBadges = (facility: CartFacility) => {
    const badges: { key: DrugKey; label: string; color: string }[] = [];
    const drugKeys: DrugKey[] = ['axicel', 'tisacel', 'lisocel', 'abecma', 'carvykti'];
    drugKeys.forEach((key) => {
      if (facility[key] === 'true') {
        badges.push({ key, label: DRUG_LABELS[key], color: DRUG_COLORS[key] });
      }
    });
    return badges;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">CAR-T施設マップ</h1>
          <AddFacilityDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <span className="text-sm font-medium">疾患カテゴリ</span>
            <Select
              value={selectedCategory}
              onValueChange={(v) => {
                setSelectedCategory(v as typeof selectedCategory);
                setSelectedDrug('all');
              }}
            >
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="lymphoma">悪性リンパ腫</SelectItem>
                <SelectItem value="bcma">BCMA標的（多発性骨髄腫）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium">薬剤</span>
            <Select value={selectedDrug} onValueChange={(v) => setSelectedDrug(v as DrugKey | 'all')}>
              <SelectTrigger className="w-48" data-testid="select-drug">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {selectedCategory === 'all' || selectedCategory === 'lymphoma'
                  ? DRUG_CATEGORIES.lymphoma.drugs.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))
                  : null}
                {selectedCategory === 'all' || selectedCategory === 'bcma'
                  ? DRUG_CATEGORIES.bcma.drugs.map((d) => (
                      <SelectItem key={d.key} value={d.key}>
                        {d.label}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground" data-testid="text-facility-count">
            表示施設数: {filteredFacilities.length}件
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 min-h-[600px] flex-wrap">
          <div className="relative w-96 h-[600px] bg-muted/30 rounded-lg border flex-shrink-0">
            <div className="absolute inset-0 p-2">
              {REGIONS.map((region) => {
                const pos = REGION_POSITIONS[region];
                const count = facilitiesByRegion[region]?.length || 0;
                const isSelected = selectedRegion === region;
                return (
                  <Button
                    key={region}
                    variant={isSelected ? 'default' : count > 0 ? 'secondary' : 'ghost'}
                    onClick={() => setSelectedRegion(isSelected ? null : region)}
                    className="absolute flex flex-col items-center p-0 w-14 h-16"
                    style={{ top: pos.top, left: pos.left }}
                    data-testid={`button-region-${region}`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      {count}
                    </div>
                    <span className="text-xs">{region}</span>
                  </Button>
                );
              })}
            </div>

            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex flex-wrap gap-1 text-xs">
                <Badge className={`${DRUG_COLORS.axicel} text-white`} data-testid="badge-legend-axicel">Axicel</Badge>
                <Badge className={`${DRUG_COLORS.tisacel} text-white`} data-testid="badge-legend-tisacel">Tisa-cel</Badge>
                <Badge className={`${DRUG_COLORS.lisocel} text-white`} data-testid="badge-legend-lisocel">Liso-cel</Badge>
                <Badge className={`${DRUG_COLORS.abecma} text-white`} data-testid="badge-legend-abecma">アベクマ</Badge>
                <Badge className={`${DRUG_COLORS.carvykti} text-white`} data-testid="badge-legend-carvykti">カービクティ</Badge>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-auto min-w-[300px]">
            {selectedRegion ? (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-region-title">
                  <MapPin className="w-5 h-5" />
                  {selectedRegion}の施設
                </h2>
                {facilitiesByRegion[selectedRegion]?.length === 0 ? (
                  <p className="text-muted-foreground" data-testid="text-no-facilities">該当する施設がありません</p>
                ) : (
                  <div className="space-y-2">
                    {facilitiesByRegion[selectedRegion]?.map((facility) => (
                      <Card key={facility.id} className="p-3" data-testid={`card-facility-${facility.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium" data-testid={`text-facility-name-${facility.id}`}>{facility.name}</span>
                              {facility.url && (
                                <a
                                  href={facility.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary"
                                  data-testid={`link-facility-url-${facility.id}`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            {facility.address && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-facility-address-${facility.id}`}>{facility.address}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {getDrugBadges(facility).map((badge) => (
                                <Badge
                                  key={badge.key}
                                  className={`${badge.color} text-white text-xs`}
                                  data-testid={`badge-drug-${facility.id}-${badge.key}`}
                                >
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(facility.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-facility-${facility.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold" data-testid="text-all-facilities-title">全施設一覧</h2>
                {isLoading ? (
                  <p data-testid="text-loading">読み込み中...</p>
                ) : filteredFacilities.length === 0 ? (
                  <p className="text-muted-foreground" data-testid="text-no-facilities">該当する施設がありません</p>
                ) : (
                  <div className="space-y-2">
                    {REGIONS.map((region) => {
                      const regionFacilities = facilitiesByRegion[region];
                      if (!regionFacilities?.length) return null;
                      return (
                        <div key={region} data-testid={`section-region-${region}`}>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">
                            {region} ({regionFacilities.length}件)
                          </h3>
                          <div className="space-y-1 ml-2">
                            {regionFacilities.map((facility) => (
                              <Card key={facility.id} className="p-2" data-testid={`card-facility-list-${facility.id}`}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                                    <span className="font-medium truncate" data-testid={`text-facility-name-list-${facility.id}`}>{facility.name}</span>
                                    <div className="flex gap-1 flex-shrink-0 flex-wrap">
                                      {getDrugBadges(facility).map((badge) => (
                                        <Badge
                                          key={badge.key}
                                          className={`${badge.color} text-white text-xs`}
                                        >
                                          {badge.label}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(facility.id)}
                                    disabled={deleteMutation.isPending}
                                    data-testid={`button-delete-facility-list-${facility.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const facilityFormSchema = z.object({
  name: z.string().min(1, '施設名を入力してください'),
  region: z.string().min(1, '地域を選択してください'),
  address: z.string().optional(),
  url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  axicel: z.boolean().default(false),
  tisacel: z.boolean().default(false),
  lisocel: z.boolean().default(false),
  abecma: z.boolean().default(false),
  carvykti: z.boolean().default(false),
});

type FacilityFormData = z.infer<typeof facilityFormSchema>;

function AddFacilityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilityFormSchema),
    defaultValues: {
      name: '',
      region: '',
      address: '',
      url: '',
      axicel: false,
      tisacel: false,
      lisocel: false,
      abecma: false,
      carvykti: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FacilityFormData) => {
      const response = await apiRequest('POST', '/api/cart-facilities', {
        name: data.name,
        region: data.region,
        address: data.address || undefined,
        url: data.url || undefined,
        axicel: data.axicel ? 'true' : 'false',
        tisacel: data.tisacel ? 'true' : 'false',
        lisocel: data.lisocel ? 'true' : 'false',
        abecma: data.abecma ? 'true' : 'false',
        carvykti: data.carvykti ? 'true' : 'false',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart-facilities'] });
      onOpenChange(false);
      form.reset();
    },
  });

  const onSubmit = (data: FacilityFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-facility">
          <Plus className="w-4 h-4 mr-2" />
          施設を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>CAR-T施設を追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>施設名 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="〇〇大学病院"
                      {...field}
                      data-testid="input-facility-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>地域 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-region">
                        <SelectValue placeholder="地域を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>住所</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="東京都〇〇区..."
                      {...field}
                      data-testid="input-facility-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>施設URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...field}
                      data-testid="input-facility-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <span className="text-sm font-medium">対応薬剤</span>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">悪性リンパ腫</p>
                  <div className="flex flex-wrap gap-3">
                    {DRUG_CATEGORIES.lymphoma.drugs.map((drug) => (
                      <FormField
                        key={drug.key}
                        control={form.control}
                        name={drug.key as DrugKey}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`checkbox-${drug.key}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{drug.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">BCMA標的</p>
                  <div className="flex flex-wrap gap-3">
                    {DRUG_CATEGORIES.bcma.drugs.map((drug) => (
                      <FormField
                        key={drug.key}
                        control={form.control}
                        name={drug.key as DrugKey}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid={`checkbox-${drug.key}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">{drug.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-submit-facility"
              >
                {createMutation.isPending ? '追加中...' : '追加'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
