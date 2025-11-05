import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, MapPin, User } from 'lucide-react';

type Conference = {
  id: string;
  year: string;
  number: string;
  title: string;
  location: string;
  president: string;
  date: string;
};

type Official = {
  id: string;
  name: string;
  position: string;
  term: string;
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

const mockSocieties: Society[] = [
  {
    id: '1',
    name: '日本血液学会',
    shortName: 'JSH',
    description: '血液学の進歩と普及を図り、国民の健康と福祉に貢献することを目的とする学会',
    conferences: [
      {
        id: 'c1',
        year: '2024',
        number: '第86回',
        title: '日本血液学会学術集会',
        location: '東京',
        president: '田中太郎',
        date: '2024年10月11日-13日',
      },
      {
        id: 'c2',
        year: '2023',
        number: '第85回',
        title: '日本血液学会学術集会',
        location: '大阪',
        president: '佐藤花子',
        date: '2023年10月13日-15日',
      },
      {
        id: 'c3',
        year: '2022',
        number: '第84回',
        title: '日本血液学会学術集会',
        location: '名古屋',
        president: '鈴木一郎',
        date: '2022年10月14日-16日',
      },
    ],
    officials: [
      {
        id: 'o1',
        name: '田中太郎',
        position: '理事長',
        term: '2023-2025',
      },
      {
        id: 'o2',
        name: '佐藤花子',
        position: '副理事長',
        term: '2023-2025',
      },
      {
        id: 'o3',
        name: '鈴木一郎',
        position: '理事',
        term: '2023-2025',
      },
    ],
  },
  {
    id: '2',
    name: '日本造血細胞移植学会',
    shortName: 'JSHCT',
    description: '造血細胞移植の発展と患者の治療成績向上を目指す学会',
    conferences: [
      {
        id: 'c4',
        year: '2024',
        number: '第46回',
        title: '日本造血細胞移植学会総会',
        location: '福岡',
        president: '山田次郎',
        date: '2024年3月7日-9日',
      },
      {
        id: 'c5',
        year: '2023',
        number: '第45回',
        title: '日本造血細胞移植学会総会',
        location: '仙台',
        president: '高橋三郎',
        date: '2023年3月9日-11日',
      },
    ],
    officials: [
      {
        id: 'o4',
        name: '山田次郎',
        position: '理事長',
        term: '2022-2024',
      },
      {
        id: 'o5',
        name: '高橋三郎',
        position: '理事',
        term: '2022-2024',
      },
    ],
  },
  {
    id: '3',
    name: '日本臨床腫瘍学会',
    shortName: 'JSMO',
    description: '悪性腫瘍の臨床・研究の発展を目指す学会',
    conferences: [
      {
        id: 'c6',
        year: '2024',
        number: '第22回',
        title: '日本臨床腫瘍学会学術集会',
        location: '横浜',
        president: '伊藤四郎',
        date: '2024年7月18日-20日',
      },
    ],
    officials: [
      {
        id: 'o6',
        name: '伊藤四郎',
        position: '理事長',
        term: '2023-2025',
      },
    ],
  },
];

export default function Societies() {
  const [selectedSociety, setSelectedSociety] = useState('1');

  const currentSociety = mockSocieties.find(s => s.id === selectedSociety);

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
            {mockSocieties.map(society => (
              <TabsTrigger
                key={society.id}
                value={society.id}
                data-testid={`tab-society-${society.shortName}`}
              >
                {society.shortName}
              </TabsTrigger>
            ))}
          </TabsList>

          {mockSocieties.map(society => (
            <TabsContent key={society.id} value={society.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle data-testid={`text-society-name-${society.shortName}`}>{society.name}</CardTitle>
                  <CardDescription data-testid={`text-society-description-${society.shortName}`}>{society.description}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid={`heading-conferences-${society.shortName}`}>
                    <Calendar className="w-5 h-5" />
                    過去の学術集会
                  </CardTitle>
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
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid={`heading-officials-${society.shortName}`}>
                    <User className="w-5 h-5" />
                    役員・役職者
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>氏名</TableHead>
                        <TableHead>役職</TableHead>
                        <TableHead>任期</TableHead>
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
                            {official.term}
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
    </div>
  );
}
