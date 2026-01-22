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
import { Plus, Trash2, ExternalLink, Building2 } from 'lucide-react';
import type { CartFacility } from '@shared/schema';

const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州', '沖縄'] as const;

const PREFECTURES_BY_REGION: Record<string, string[]> = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  '沖縄': ['沖縄県'],
};

const ALL_PREFECTURES = Object.values(PREFECTURES_BY_REGION).flat();

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

const REGION_COLORS: Record<string, string> = {
  '北海道': 'bg-violet-400',
  '東北': 'bg-blue-400',
  '関東': 'bg-sky-300',
  '中部': 'bg-green-400',
  '近畿': 'bg-yellow-400',
  '中国': 'bg-amber-400',
  '四国': 'bg-red-300',
  '九州': 'bg-rose-400',
  '沖縄': 'bg-purple-300',
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

  const drugCounts = useMemo(() => {
    const counts: Record<DrugKey, number> = {
      axicel: 0,
      tisacel: 0,
      lisocel: 0,
      abecma: 0,
      carvykti: 0,
    };
    filteredFacilities.forEach((f) => {
      if (f.axicel === 'true') counts.axicel++;
      if (f.tisacel === 'true') counts.tisacel++;
      if (f.lisocel === 'true') counts.lisocel++;
      if (f.abecma === 'true') counts.abecma++;
      if (f.carvykti === 'true') counts.carvykti++;
    });
    return counts;
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

        <div className="flex flex-wrap gap-2" data-testid="drug-counts">
          <span className="text-sm font-medium mr-2">薬剤別施設数:</span>
          {Object.entries(drugCounts).map(([key, count]) => (
            <Badge
              key={key}
              className={`${DRUG_COLORS[key as DrugKey]} text-white`}
              data-testid={`badge-count-${key}`}
            >
              {DRUG_LABELS[key as DrugKey]}: {count}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 min-h-[600px] flex-wrap">
          <div className="relative flex-shrink-0" style={{ width: '400px', height: '600px' }}>
            <JapanMap
              facilitiesByRegion={facilitiesByRegion}
              selectedRegion={selectedRegion}
              onRegionClick={(region) => setSelectedRegion(selectedRegion === region ? null : region)}
            />
          </div>

          <div className="flex-1 space-y-2 overflow-auto min-w-[300px]">
            {selectedRegion ? (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2" data-testid="text-region-title">
                  <Badge className={`${REGION_COLORS[selectedRegion]} text-foreground`}>{selectedRegion}</Badge>
                  の施設
                </h2>
                {facilitiesByRegion[selectedRegion]?.length === 0 ? (
                  <p className="text-muted-foreground" data-testid="text-no-facilities">該当する施設がありません</p>
                ) : (
                  <div className="space-y-2">
                    {facilitiesByRegion[selectedRegion]?.map((facility) => (
                      <FacilityCard
                        key={facility.id}
                        facility={facility}
                        getDrugBadges={getDrugBadges}
                        onDelete={() => deleteMutation.mutate(facility.id)}
                        isDeleting={deleteMutation.isPending}
                      />
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
                          <h3 className="font-medium text-sm mb-1 flex items-center gap-2">
                            <Badge className={`${REGION_COLORS[region]} text-foreground`}>{region}</Badge>
                            <span className="text-muted-foreground">({regionFacilities.length}件)</span>
                          </h3>
                          <div className="space-y-1 ml-2">
                            {regionFacilities.map((facility) => (
                              <Card key={facility.id} className="p-2" data-testid={`card-facility-list-${facility.id}`}>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                                    <span className="font-medium truncate" data-testid={`text-facility-name-list-${facility.id}`}>{facility.name}</span>
                                    {facility.prefecture && (
                                      <span className="text-xs text-muted-foreground">({facility.prefecture})</span>
                                    )}
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

function JapanMap({
  facilitiesByRegion,
  selectedRegion,
  onRegionClick,
}: {
  facilitiesByRegion: Record<string, CartFacility[]>;
  selectedRegion: string | null;
  onRegionClick: (region: string) => void;
}) {
  return (
    <div className="relative w-full h-full bg-blue-50 dark:bg-blue-950/20 rounded-lg overflow-hidden">
      <svg viewBox="0 0 400 600" className="w-full h-full">
        <g className="cursor-pointer" onClick={() => onRegionClick('北海道')}>
          <path
            d="M300,20 L370,30 L380,80 L350,120 L300,110 L280,70 Z"
            className={`${selectedRegion === '北海道' ? 'fill-violet-500' : 'fill-violet-400'} stroke-white stroke-2 hover-elevate`}
            data-testid="region-北海道"
          />
          <text x="330" y="75" className="text-xs font-bold fill-foreground" textAnchor="middle">
            北海道({facilitiesByRegion['北海道']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('東北')}>
          <path
            d="M280,130 L340,140 L350,220 L300,260 L260,240 L250,170 Z"
            className={`${selectedRegion === '東北' ? 'fill-blue-500' : 'fill-blue-400'} stroke-white stroke-2`}
            data-testid="region-東北"
          />
          <text x="300" y="200" className="text-xs font-bold fill-foreground" textAnchor="middle">
            東北({facilitiesByRegion['東北']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('関東')}>
          <path
            d="M260,260 L320,270 L330,340 L280,360 L240,340 L230,290 Z"
            className={`${selectedRegion === '関東' ? 'fill-sky-400' : 'fill-sky-300'} stroke-white stroke-2`}
            data-testid="region-関東"
          />
          <text x="280" y="310" className="text-xs font-bold fill-foreground" textAnchor="middle">
            関東({facilitiesByRegion['関東']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('中部')}>
          <path
            d="M200,280 L240,290 L250,360 L200,390 L150,370 L140,310 Z"
            className={`${selectedRegion === '中部' ? 'fill-green-500' : 'fill-green-400'} stroke-white stroke-2`}
            data-testid="region-中部"
          />
          <text x="195" y="340" className="text-xs font-bold fill-foreground" textAnchor="middle">
            中部({facilitiesByRegion['中部']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('近畿')}>
          <path
            d="M140,370 L200,380 L210,430 L160,450 L120,430 L110,390 Z"
            className={`${selectedRegion === '近畿' ? 'fill-yellow-500' : 'fill-yellow-400'} stroke-white stroke-2`}
            data-testid="region-近畿"
          />
          <text x="160" y="415" className="text-xs font-bold fill-foreground" textAnchor="middle">
            近畿({facilitiesByRegion['近畿']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('中国')}>
          <path
            d="M60,390 L120,400 L130,450 L90,470 L50,450 L40,410 Z"
            className={`${selectedRegion === '中国' ? 'fill-amber-500' : 'fill-amber-400'} stroke-white stroke-2`}
            data-testid="region-中国"
          />
          <text x="85" y="435" className="text-xs font-bold fill-foreground" textAnchor="middle">
            中国({facilitiesByRegion['中国']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('四国')}>
          <path
            d="M100,470 L150,475 L160,510 L130,530 L90,515 L80,485 Z"
            className={`${selectedRegion === '四国' ? 'fill-red-400' : 'fill-red-300'} stroke-white stroke-2`}
            data-testid="region-四国"
          />
          <text x="120" y="500" className="text-xs font-bold fill-foreground" textAnchor="middle">
            四国({facilitiesByRegion['四国']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('九州')}>
          <path
            d="M30,470 L70,480 L80,550 L50,580 L20,560 L10,500 Z"
            className={`${selectedRegion === '九州' ? 'fill-rose-500' : 'fill-rose-400'} stroke-white stroke-2`}
            data-testid="region-九州"
          />
          <text x="45" y="525" className="text-xs font-bold fill-foreground" textAnchor="middle">
            九州({facilitiesByRegion['九州']?.length || 0})
          </text>
        </g>

        <g className="cursor-pointer" onClick={() => onRegionClick('沖縄')}>
          <ellipse
            cx="50"
            cy="130"
            rx="30"
            ry="20"
            className={`${selectedRegion === '沖縄' ? 'fill-purple-400' : 'fill-purple-300'} stroke-white stroke-2`}
            data-testid="region-沖縄"
          />
          <text x="50" y="135" className="text-xs font-bold fill-foreground" textAnchor="middle">
            沖縄({facilitiesByRegion['沖縄']?.length || 0})
          </text>
        </g>
      </svg>

      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex flex-wrap gap-1 text-xs bg-background/80 p-2 rounded">
          <Badge className={`${DRUG_COLORS.axicel} text-white`} data-testid="badge-legend-axicel">Axicel</Badge>
          <Badge className={`${DRUG_COLORS.tisacel} text-white`} data-testid="badge-legend-tisacel">Tisa-cel</Badge>
          <Badge className={`${DRUG_COLORS.lisocel} text-white`} data-testid="badge-legend-lisocel">Liso-cel</Badge>
          <Badge className={`${DRUG_COLORS.abecma} text-white`} data-testid="badge-legend-abecma">アベクマ</Badge>
          <Badge className={`${DRUG_COLORS.carvykti} text-white`} data-testid="badge-legend-carvykti">カービクティ</Badge>
        </div>
      </div>
    </div>
  );
}

function FacilityCard({
  facility,
  getDrugBadges,
  onDelete,
  isDeleting,
}: {
  facility: CartFacility;
  getDrugBadges: (f: CartFacility) => { key: DrugKey; label: string; color: string }[];
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="p-3" data-testid={`card-facility-${facility.id}`}>
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
          {facility.prefecture && (
            <p className="text-sm text-muted-foreground" data-testid={`text-facility-prefecture-${facility.id}`}>
              {facility.prefecture}
            </p>
          )}
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
          onClick={onDelete}
          disabled={isDeleting}
          data-testid={`button-delete-facility-${facility.id}`}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}

const facilityFormSchema = z.object({
  name: z.string().min(1, '施設名を入力してください'),
  region: z.string().min(1, '地域を選択してください'),
  prefecture: z.string().optional(),
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
      prefecture: '',
      address: '',
      url: '',
      axicel: false,
      tisacel: false,
      lisocel: false,
      abecma: false,
      carvykti: false,
    },
  });

  const selectedRegion = form.watch('region');
  const availablePrefectures = selectedRegion ? PREFECTURES_BY_REGION[selectedRegion] || [] : ALL_PREFECTURES;

  const createMutation = useMutation({
    mutationFn: async (data: FacilityFormData) => {
      const response = await apiRequest('POST', '/api/cart-facilities', {
        name: data.name,
        region: data.region,
        prefecture: data.prefecture || undefined,
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <Select onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue('prefecture', '');
                  }} value={field.value}>
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
              name="prefecture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>都道府県</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-prefecture">
                        <SelectValue placeholder="都道府県を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePrefectures.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
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
