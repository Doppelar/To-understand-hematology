import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    if (facility.axicel === 'true')
      badges.push({ key: 'axicel', label: 'Axicel', color: 'bg-blue-500' });
    if (facility.tisacel === 'true')
      badges.push({ key: 'tisacel', label: 'Tisa-cel', color: 'bg-green-500' });
    if (facility.lisocel === 'true')
      badges.push({ key: 'lisocel', label: 'Liso-cel', color: 'bg-purple-500' });
    if (facility.abecma === 'true')
      badges.push({ key: 'abecma', label: 'アベクマ', color: 'bg-orange-500' });
    if (facility.carvykti === 'true')
      badges.push({ key: 'carvykti', label: 'カービクティ', color: 'bg-red-500' });
    return badges;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">CAR-T施設マップ</h1>
          <AddFacilityDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label>疾患カテゴリ</Label>
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
            <Label>薬剤</Label>
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

          <div className="text-sm text-muted-foreground">
            表示施設数: {filteredFacilities.length}件
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 min-h-[600px]">
          <div className="relative w-96 h-[600px] bg-muted/30 rounded-lg border flex-shrink-0">
            <div className="absolute inset-0 p-2">
              {REGIONS.map((region) => {
                const pos = REGION_POSITIONS[region];
                const count = facilitiesByRegion[region]?.length || 0;
                const isSelected = selectedRegion === region;
                return (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(isSelected ? null : region)}
                    className={`absolute flex flex-col items-center transition-all ${
                      isSelected ? 'scale-110 z-10' : ''
                    }`}
                    style={{ top: pos.top, left: pos.left }}
                    data-testid={`region-${region}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-colors ${
                        count > 0
                          ? isSelected
                            ? 'bg-primary'
                            : 'bg-primary/80 hover:bg-primary'
                          : 'bg-muted-foreground/50'
                      }`}
                    >
                      {count}
                    </div>
                    <span className="text-xs mt-1 font-medium">{region}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex flex-wrap gap-1 text-xs">
                <Badge className="bg-blue-500">Axicel</Badge>
                <Badge className="bg-green-500">Tisa-cel</Badge>
                <Badge className="bg-purple-500">Liso-cel</Badge>
                <Badge className="bg-orange-500">アベクマ</Badge>
                <Badge className="bg-red-500">カービクティ</Badge>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-auto">
            {selectedRegion ? (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedRegion}の施設
                </h2>
                {facilitiesByRegion[selectedRegion]?.length === 0 ? (
                  <p className="text-muted-foreground">該当する施設がありません</p>
                ) : (
                  <div className="space-y-2">
                    {facilitiesByRegion[selectedRegion]?.map((facility) => (
                      <Card key={facility.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{facility.name}</span>
                              {facility.url && (
                                <a
                                  href={facility.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            {facility.address && (
                              <p className="text-sm text-muted-foreground">{facility.address}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
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
                            data-testid={`delete-facility-${facility.id}`}
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
                <h2 className="text-lg font-semibold">全施設一覧</h2>
                {isLoading ? (
                  <p>読み込み中...</p>
                ) : filteredFacilities.length === 0 ? (
                  <p className="text-muted-foreground">該当する施設がありません</p>
                ) : (
                  <div className="space-y-2">
                    {REGIONS.map((region) => {
                      const regionFacilities = facilitiesByRegion[region];
                      if (!regionFacilities?.length) return null;
                      return (
                        <div key={region}>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">
                            {region} ({regionFacilities.length}件)
                          </h3>
                          <div className="space-y-1 ml-2">
                            {regionFacilities.map((facility) => (
                              <Card key={facility.id} className="p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="font-medium truncate">{facility.name}</span>
                                    <div className="flex gap-1 flex-shrink-0">
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

function AddFacilityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [drugs, setDrugs] = useState<Record<DrugKey, boolean>>({
    axicel: false,
    tisacel: false,
    lisocel: false,
    abecma: false,
    carvykti: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      region: string;
      address?: string;
      url?: string;
      axicel: string;
      tisacel: string;
      lisocel: string;
      abecma: string;
      carvykti: string;
    }) => {
      const response = await apiRequest('POST', '/api/cart-facilities', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart-facilities'] });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setRegion('');
    setAddress('');
    setUrl('');
    setDrugs({
      axicel: false,
      tisacel: false,
      lisocel: false,
      abecma: false,
      carvykti: false,
    });
  };

  const handleSubmit = () => {
    if (!name || !region) return;
    createMutation.mutate({
      name,
      region,
      address: address || undefined,
      url: url || undefined,
      axicel: drugs.axicel ? 'true' : 'false',
      tisacel: drugs.tisacel ? 'true' : 'false',
      lisocel: drugs.lisocel ? 'true' : 'false',
      abecma: drugs.abecma ? 'true' : 'false',
      carvykti: drugs.carvykti ? 'true' : 'false',
    });
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
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="facility-name">施設名 *</Label>
            <Input
              id="facility-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="〇〇大学病院"
              data-testid="input-facility-name"
            />
          </div>

          <div className="space-y-1">
            <Label>地域 *</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger data-testid="select-region">
                <SelectValue placeholder="地域を選択" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="facility-address">住所</Label>
            <Input
              id="facility-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="東京都〇〇区..."
              data-testid="input-facility-address"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="facility-url">施設URL</Label>
            <Input
              id="facility-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              data-testid="input-facility-url"
            />
          </div>

          <div className="space-y-2">
            <Label>対応薬剤</Label>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">悪性リンパ腫</p>
                <div className="flex flex-wrap gap-3">
                  {DRUG_CATEGORIES.lymphoma.drugs.map((drug) => (
                    <label key={drug.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={drugs[drug.key as DrugKey]}
                        onCheckedChange={(checked) =>
                          setDrugs((prev) => ({ ...prev, [drug.key]: !!checked }))
                        }
                        data-testid={`checkbox-${drug.key}`}
                      />
                      <span className="text-sm">{drug.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">BCMA標的</p>
                <div className="flex flex-wrap gap-3">
                  {DRUG_CATEGORIES.bcma.drugs.map((drug) => (
                    <label key={drug.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={drugs[drug.key as DrugKey]}
                        onCheckedChange={(checked) =>
                          setDrugs((prev) => ({ ...prev, [drug.key]: !!checked }))
                        }
                        data-testid={`checkbox-${drug.key}`}
                      />
                      <span className="text-sm">{drug.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !region || createMutation.isPending}
              data-testid="button-submit-facility"
            >
              追加
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
