import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Network, Plus, Edit, Trash2, ArrowUpDown, FileSpreadsheet } from 'lucide-react';
import { useLocation } from 'wouter';
import AddNodeForm from '@/components/AddNodeForm';
import EditNodeDialog from '@/components/EditNodeDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Node } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import * as XLSX from 'xlsx';

export default function Directory() {
  const { toast } = useToast();
  const { data: people = [], isLoading } = useQuery<Node[]>({
    queryKey: ['/api/nodes'],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Node | null>(null);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [, setLocation] = useLocation();

  const regions = Array.from(new Set(people.map(p => p.region).filter(Boolean)));

  const filteredPeople = useMemo(() => {
    const filtered = people.filter(person => {
      const matchesSearch = !searchQuery || 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.facilityName && person.facilityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.position && person.position.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRegion = !selectedRegion || person.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });

    // ソート処理
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'ja');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'ja');
        case 'gradYear-asc':
          return (a.graduationYear || '').localeCompare(b.graduationYear || '');
        case 'gradYear-desc':
          return (b.graduationYear || '').localeCompare(a.graduationYear || '');
        case 'gradUniv-asc':
          return (a.graduationUniversity || '').localeCompare(b.graduationUniversity || '', 'ja');
        case 'gradUniv-desc':
          return (b.graduationUniversity || '').localeCompare(a.graduationUniversity || '', 'ja');
        case 'facility-asc':
          return (a.facilityName || '').localeCompare(b.facilityName || '', 'ja');
        case 'facility-desc':
          return (b.facilityName || '').localeCompare(a.facilityName || '', 'ja');
        case 'appointment-asc':
          return (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
        case 'appointment-desc':
          return (b.appointmentDate || '').localeCompare(a.appointmentDate || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [people, searchQuery, selectedRegion, sortBy]);

  const togglePersonSelection = (personId: string) => {
    const newSelection = new Set(selectedPeople);
    if (newSelection.has(personId)) {
      newSelection.delete(personId);
    } else {
      newSelection.add(personId);
    }
    setSelectedPeople(newSelection);
  };

  const handleGenerateMap = () => {
    setLocation('/');
  };

  const selectAll = () => {
    setSelectedPeople(new Set(filteredPeople.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedPeople(new Set());
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create node');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nodes'] });
      setAddDialogOpen(false);
      toast({
        title: '追加しました',
        description: '新しいノードが追加されました',
      });
    },
    onError: () => {
      toast({
        title: 'エラー',
        description: 'ノードの追加に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/nodes/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update node');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nodes'] });
      setEditingPerson(null);
      toast({
        title: '更新しました',
        description: 'ノードが更新されました',
      });
    },
    onError: () => {
      toast({
        title: 'エラー',
        description: 'ノードの更新に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/nodes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete node');
      return;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/nodes'] });
      const newSelection = new Set(selectedPeople);
      newSelection.delete(id);
      setSelectedPeople(newSelection);
      setDeletingPersonId(null);
      setEditingPerson(null);
      toast({
        title: '削除しました',
        description: 'ノードが削除されました',
      });
    },
    onError: () => {
      toast({
        title: 'エラー',
        description: 'ノードの削除に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const handleAddPerson = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEditPerson = (data: any) => {
    updateMutation.mutate(data);
  };

  const handleDeletePerson = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleExportToExcel = () => {
    if (filteredPeople.length === 0) {
      toast({
        title: 'エクスポートできません',
        description: '表示するデータがありません',
        variant: 'destructive',
      });
      return;
    }

    // Excelデータの準備
    const excelData = filteredPeople.map(person => ({
      '名前': person.name,
      '出身大学': person.graduationUniversity || '',
      '卒年': person.graduationYear || '',
      '施設名': person.facilityName || '',
      '役職': person.position || '',
      '専門分野': person.specialty || '',
      '地域': person.region || '',
      '就任日': person.appointmentDate || '',
      '退官日': person.retirementDate || '',
    }));

    // ワークシートとワークブックの作成
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '名鑑');

    // ファイル名の生成（現在日時を含む）
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `血液内科名鑑_${dateStr}_${timeStr}.xlsx`;

    // ファイルのダウンロード
    XLSX.writeFile(wb, filename);

    toast({
      title: 'エクスポート完了',
      description: `${filteredPeople.length}件のデータをExcelファイルに出力しました`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground" data-testid="heading-directory">名鑑</h1>
          <div className="flex items-center gap-2">
            {selectedPeople.size > 0 && (
              <>
                <span className="text-sm text-muted-foreground" data-testid="text-selected-count">
                  {selectedPeople.size}名選択中
                </span>
                <Button onClick={handleGenerateMap} data-testid="button-generate-map">
                  <Network className="w-4 h-4 mr-2" />
                  マップを生成
                </Button>
              </>
            )}
            <Button 
              onClick={handleExportToExcel} 
              variant="outline"
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel出力
            </Button>
            <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-person">
              <Plus className="w-4 h-4 mr-2" />
              新規追加
            </Button>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="名前、施設、役職で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="min-w-[200px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">名前（昇順）</SelectItem>
                <SelectItem value="name-desc">名前（降順）</SelectItem>
                <SelectItem value="gradYear-asc">卒年（古い順）</SelectItem>
                <SelectItem value="gradYear-desc">卒年（新しい順）</SelectItem>
                <SelectItem value="gradUniv-asc">出身大学（昇順）</SelectItem>
                <SelectItem value="gradUniv-desc">出身大学（降順）</SelectItem>
                <SelectItem value="facility-asc">施設名（昇順）</SelectItem>
                <SelectItem value="facility-desc">施設名（降順）</SelectItem>
                <SelectItem value="appointment-asc">就任日（古い順）</SelectItem>
                <SelectItem value="appointment-desc">就任日（新しい順）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            {regions.map(region => (
              <Badge
                key={region}
                variant={selectedRegion === region ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedRegion(selectedRegion === region ? null : region!)}
                data-testid={`filter-region-${region}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {region}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
            <h2 className="text-lg font-semibold">
              {filteredPeople.length}名の専門家
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                すべて選択
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} data-testid="button-deselect-all">
                選択解除
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>施設</TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead>出身大学</TableHead>
                  <TableHead>卒年</TableHead>
                  <TableHead>就任日</TableHead>
                  <TableHead>退官日</TableHead>
                  <TableHead>専門領域</TableHead>
                  <TableHead>地域</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.map(person => (
                  <TableRow
                    key={person.id}
                    className="hover-elevate"
                    data-testid={`row-person-${person.id}`}
                  >
                    <TableCell onClick={(e) => {
                      e.stopPropagation();
                      togglePersonSelection(person.id);
                    }}>
                      <Checkbox
                        checked={selectedPeople.has(person.id)}
                        onCheckedChange={() => togglePersonSelection(person.id)}
                        data-testid={`checkbox-person-${person.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={person.photoUrl || ''} />
                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.facilityName || ''}</TableCell>
                    <TableCell>{person.position || ''}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{person.graduationUniversity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{person.graduationYear}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{person.appointmentDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{person.retirementDate}</TableCell>
                    <TableCell>
                      {person.specialty && (
                        <Badge variant="secondary">{person.specialty}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {person.region}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPerson(person);
                          }}
                          data-testid={`button-edit-${person.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPersonId(person.id);
                          }}
                          data-testid={`button-delete-${person.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規追加</DialogTitle>
          </DialogHeader>
          <AddNodeForm onSubmit={handleAddPerson} />
        </DialogContent>
      </Dialog>

      <EditNodeDialog
        open={!!editingPerson}
        onOpenChange={(open) => !open && setEditingPerson(null)}
        node={editingPerson ? {
          ...editingPerson,
          facilityName: editingPerson.facilityName || undefined,
          position: editingPerson.position || undefined,
          career: editingPerson.career || undefined,
          specialty: editingPerson.specialty || undefined,
          region: editingPerson.region || undefined,
          photoUrl: editingPerson.photoUrl || undefined,
          graduationUniversity: editingPerson.graduationUniversity || undefined,
          graduationYear: editingPerson.graduationYear || undefined,
          appointmentDate: editingPerson.appointmentDate || undefined,
          retirementDate: editingPerson.retirementDate || undefined,
        } : null}
        onSave={handleEditPerson}
        onDelete={handleDeletePerson}
      />

      <AlertDialog open={!!deletingPersonId} onOpenChange={(open) => !open && setDeletingPersonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              この人物を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPersonId && handleDeletePerson(deletingPersonId)}
              data-testid="button-confirm-delete"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
