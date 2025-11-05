import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Calendar, MapPin, User, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConferenceForm from '@/components/ConferenceForm';
import OfficialForm from '@/components/OfficialForm';

type Conference = {
  id: string;
  year: string;
  number: string;
  title: string;
  theme?: string;
  location: string;
  president: string;
  date: string;
};

type Official = {
  id: string;
  nodeId: string;
  name: string;
  position: string;
  term: string;
  institution: string;
  photoUrl?: string;
};

type Society = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  conferences: Conference[];
  officials: Official[];
};

export default function Societies() {
  const { toast } = useToast();
  const [selectedSociety, setSelectedSociety] = useState('');
  const [addConferenceDialogOpen, setAddConferenceDialogOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference & { societyId: string } | null>(null);
  const [deletingConference, setDeletingConference] = useState<{ id: string; societyId: string } | null>(null);
  const [addOfficialDialogOpen, setAddOfficialDialogOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official & { societyId: string } | null>(null);
  const [deletingOfficial, setDeletingOfficial] = useState<{ id: string; societyId: string } | null>(null);

  // Fetch societies with relations
  const { data: societies = [], isLoading, error } = useQuery<Society[]>({
    queryKey: ['/api/societies-with-relations'],
  });

  // Set initial selected society when data loads
  useEffect(() => {
    if (societies.length > 0 && !selectedSociety) {
      setSelectedSociety(societies[0].id);
    }
  }, [societies, selectedSociety]);

  const currentSociety = societies.find(s => s.id === selectedSociety);

  // Add conference mutation
  const addConferenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/conferences', {
        societyId: selectedSociety,
        year: data.year,
        number: data.number || '',
        title: data.title,
        theme: data.theme || null,
        location: data.location || '',
        president: data.president || '',
        date: data.date || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setAddConferenceDialogOpen(false);
      toast({
        title: '学術集会を追加しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '学術集会の追加に失敗しました',
        variant: 'destructive',
      });
    },
  });

  // Edit conference mutation
  const editConferenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/conferences/${data.id}`, {
        year: data.year,
        number: data.number || '',
        title: data.title,
        theme: data.theme || null,
        location: data.location || '',
        president: data.president || '',
        date: data.date || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setEditingConference(null);
      toast({
        title: '学術集会を更新しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '学術集会の更新に失敗しました',
        variant: 'destructive',
      });
    },
  });

  // Delete conference mutation
  const deleteConferenceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/conferences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setDeletingConference(null);
      toast({
        title: '学術集会を削除しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '学術集会の削除に失敗しました',
        variant: 'destructive',
      });
    },
  });

  // Add official mutation
  const addOfficialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/society-officials', {
        societyId: selectedSociety,
        nodeId: data.nodeId,
        position: data.position,
        term: data.term || null,
        institution: data.institution || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setAddOfficialDialogOpen(false);
      toast({
        title: '役員を追加しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '役員の追加に失敗しました',
        variant: 'destructive',
      });
    },
  });

  // Edit official mutation
  const editOfficialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/society-officials/${data.id}`, {
        nodeId: data.nodeId,
        position: data.position,
        term: data.term || null,
        institution: data.institution || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setEditingOfficial(null);
      toast({
        title: '役員を更新しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '役員の更新に失敗しました',
        variant: 'destructive',
      });
    },
  });

  // Delete official mutation
  const deleteOfficialMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/society-officials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/societies-with-relations'] });
      setDeletingOfficial(null);
      toast({
        title: '役員を削除しました',
      });
    },
    onError: () => {
      toast({
        title: 'エラーが発生しました',
        description: '役員の削除に失敗しました',
        variant: 'destructive',
      });
    },
  });

  const handleAddConference = (data: any) => {
    addConferenceMutation.mutate(data);
  };

  const handleEditConference = (data: any) => {
    editConferenceMutation.mutate(data);
  };

  const handleDeleteConference = () => {
    if (!deletingConference) return;
    deleteConferenceMutation.mutate(deletingConference.id);
  };

  const handleAddOfficial = (data: any) => {
    addOfficialMutation.mutate(data);
  };

  const handleEditOfficial = (data: any) => {
    editOfficialMutation.mutate(data);
  };

  const handleDeleteOfficial = () => {
    if (!deletingOfficial) return;
    deleteOfficialMutation.mutate(deletingOfficial.id);
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">学会データの取得に失敗しました</p>
        <Button onClick={() => window.location.reload()}>再読み込み</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (societies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">学会データがありません</p>
      </div>
    );
  }

  if (!selectedSociety) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold text-foreground" data-testid="heading-societies">学会</h1>
        <p className="text-sm text-muted-foreground mt-1" data-testid="text-societies-description">
          血液内科関連の主要学会の情報
        </p>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <Tabs value={selectedSociety} onValueChange={setSelectedSociety}>
            <TabsList className="mb-4" data-testid="tabs-societies">
              {societies.map(society => (
                <TabsTrigger
                  key={society.id}
                  value={society.id}
                  data-testid={`tab-society-${society.shortName}`}
                >
                  {society.shortName}
                </TabsTrigger>
              ))}
            </TabsList>

          {societies.map(society => (
            <TabsContent key={society.id} value={society.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle data-testid={`text-society-name-${society.shortName}`}>{society.name}</CardTitle>
                  <CardDescription data-testid={`text-society-description-${society.shortName}`}>{society.description}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="flex items-center gap-2" data-testid={`heading-conferences-${society.shortName}`}>
                    <Calendar className="w-5 h-5" />
                    過去の学術集会
                  </CardTitle>
                  <Button
                    onClick={() => setAddConferenceDialogOpen(true)}
                    data-testid={`button-add-conference-${society.shortName}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    学術集会を追加
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {society.conferences.map(conference => (
                      <div
                        key={conference.id}
                        className="p-4 rounded-md border hover-elevate"
                        data-testid={`conference-${conference.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{conference.year}年</Badge>
                              <h3 className="font-semibold text-lg">
                                {conference.number} {conference.title}
                              </h3>
                            </div>
                            {conference.theme && (
                              <p className="text-sm font-medium mb-2" data-testid={`text-conference-theme-${conference.id}`}>
                                テーマ: {conference.theme}
                              </p>
                            )}
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {conference.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                会長: {conference.president}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {conference.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingConference({ ...conference, societyId: society.id })}
                              data-testid={`button-edit-conference-${conference.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingConference({ id: conference.id, societyId: society.id })}
                              data-testid={`button-delete-conference-${conference.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="flex items-center gap-2" data-testid={`heading-officials-${society.shortName}`}>
                    <User className="w-5 h-5" />
                    役員・役職者
                  </CardTitle>
                  <Button
                    onClick={() => setAddOfficialDialogOpen(true)}
                    data-testid={`button-add-official-${society.shortName}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    役員を追加
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>氏名</TableHead>
                        <TableHead>役職</TableHead>
                        <TableHead>任期</TableHead>
                        <TableHead>就任機関</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {society.officials.map(official => (
                        <TableRow key={official.id} data-testid={`official-${official.id}`}>
                          <TableCell className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={official.photoUrl} />
                              <AvatarFallback>{official.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{official.name}</span>
                          </TableCell>
                          <TableCell>
                            <Badge>{official.position}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {official.term || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {official.institution || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingOfficial({ ...official, societyId: society.id })}
                                data-testid={`button-edit-official-${official.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingOfficial({ id: official.id, societyId: society.id })}
                                data-testid={`button-delete-official-${official.id}`}
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
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={addConferenceDialogOpen} onOpenChange={setAddConferenceDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="add-conference-description">
          <DialogHeader>
            <DialogTitle>学術集会を追加</DialogTitle>
            <p id="add-conference-description" className="sr-only">新しい学術集会を追加するフォーム</p>
          </DialogHeader>
          <ConferenceForm
            onSubmit={handleAddConference}
            onCancel={() => setAddConferenceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingConference} onOpenChange={(open) => !open && setEditingConference(null)}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-conference-description">
          <DialogHeader>
            <DialogTitle>学術集会を編集</DialogTitle>
            <p id="edit-conference-description" className="sr-only">既存の学術集会を編集するフォーム</p>
          </DialogHeader>
          {editingConference && (
            <ConferenceForm
              initialData={editingConference}
              onSubmit={handleEditConference}
              onCancel={() => setEditingConference(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingConference} onOpenChange={(open) => !open && setDeletingConference(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              この学術集会を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-conference">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConference}
              data-testid="button-confirm-delete-conference"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addOfficialDialogOpen} onOpenChange={setAddOfficialDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="add-official-description">
          <DialogHeader>
            <DialogTitle>役員を追加</DialogTitle>
            <p id="add-official-description" className="sr-only">新しい役員を追加するフォーム</p>
          </DialogHeader>
          <OfficialForm
            onSubmit={handleAddOfficial}
            onCancel={() => setAddOfficialDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingOfficial} onOpenChange={(open) => !open && setEditingOfficial(null)}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-official-description">
          <DialogHeader>
            <DialogTitle>役員を編集</DialogTitle>
            <p id="edit-official-description" className="sr-only">既存の役員を編集するフォーム</p>
          </DialogHeader>
          {editingOfficial && (
            <OfficialForm
              initialData={{
                id: editingOfficial.id,
                nodeId: editingOfficial.nodeId,
                position: editingOfficial.position,
                term: editingOfficial.term || '',
                institution: editingOfficial.institution || '',
              }}
              onSubmit={handleEditOfficial}
              onCancel={() => setEditingOfficial(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingOfficial} onOpenChange={(open) => !open && setDeletingOfficial(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>
              この役員を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-official">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOfficial}
              data-testid="button-confirm-delete-official"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
