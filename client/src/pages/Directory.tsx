import { useState, useMemo } from 'react';
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
import { Search, MapPin, Network, Plus, Edit, Trash2 } from 'lucide-react';
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
import businessPerson from '@assets/generated_images/Professional_Japanese_businessperson_portrait_f0615887.png';
import medicalProfessional from '@assets/generated_images/Japanese_medical_professional_portrait_c3b51456.png';
import researcher from '@assets/generated_images/Japanese_researcher_portrait_dcaf188f.png';

type Person = {
  id: string;
  name: string;
  facilityName: string;
  position?: string;
  career?: string;
  specialty?: string;
  region?: string;
  photoUrl?: string;
  appointmentDate?: string;
  retirementDate?: string;
};

const initialPeople: Person[] = [
  {
    id: '1',
    name: '田中太郎',
    facilityName: '東京大学',
    position: '教授',
    specialty: 'MCL',
    region: '関東',
    photoUrl: medicalProfessional,
  },
  {
    id: '2',
    name: '佐藤花子',
    facilityName: '大阪大学',
    position: '准教授',
    specialty: '移植',
    region: '関西',
    photoUrl: businessPerson,
  },
  {
    id: '3',
    name: '鈴木一郎',
    facilityName: '名古屋大学',
    position: '講師',
    specialty: '悪性リンパ腫',
    region: '中部',
    photoUrl: researcher,
  },
];

export default function Directory() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const specialties = Array.from(new Set(people.map(p => p.specialty).filter(Boolean)));
  const regions = Array.from(new Set(people.map(p => p.region).filter(Boolean)));

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = !searchQuery || 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.position && person.position.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSpecialty = !selectedSpecialty || person.specialty === selectedSpecialty;
      const matchesRegion = !selectedRegion || person.region === selectedRegion;

      return matchesSearch && matchesSpecialty && matchesRegion;
    });
  }, [people, searchQuery, selectedSpecialty, selectedRegion]);

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

  const handleAddPerson = (data: any) => {
    const newPerson: Person = {
      id: `${Date.now()}`,
      name: data.name,
      facilityName: data.facilityName || '',
      position: data.position,
      career: data.career,
      specialty: data.specialty,
      region: data.region,
      photoUrl: data.photoUrl,
      appointmentDate: data.appointmentDate,
      retirementDate: data.retirementDate,
    };
    setPeople([...people, newPerson]);
    setAddDialogOpen(false);
  };

  const handleEditPerson = (data: any) => {
    setPeople(people.map(p => p.id === data.id ? {
      ...p,
      name: data.name,
      facilityName: data.facilityName || '',
      position: data.position,
      career: data.career,
      specialty: data.specialty,
      region: data.region,
      photoUrl: data.photoUrl,
      appointmentDate: data.appointmentDate,
      retirementDate: data.retirementDate,
    } : p));
    setEditingPerson(null);
  };

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    const newSelection = new Set(selectedPeople);
    newSelection.delete(id);
    setSelectedPeople(newSelection);
    setDeletingPersonId(null);
    setEditingPerson(null);
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

          <div className="flex gap-2 flex-wrap">
            {specialties.map(specialty => (
              <Badge
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty!)}
                data-testid={`filter-specialty-${specialty}`}
              >
                {specialty}
              </Badge>
            ))}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>施設</TableHead>
                  <TableHead>役職</TableHead>
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
                        <AvatarImage src={person.photoUrl} />
                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.facilityName}</TableCell>
                    <TableCell>{person.position}</TableCell>
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
        node={editingPerson}
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
