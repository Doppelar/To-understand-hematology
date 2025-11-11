import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brain, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import type { Node } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

type QuestionType = 'photo' | 'university' | 'facility' | 'region';

type QuizQuestion = {
  person: Node;
  type: QuestionType;
  options: Node[];
};

type QuizState = 'setup' | 'quiz' | 'result';

export default function Quiz() {
  const { data: people = [], isLoading } = useQuery<Node[]>({
    queryKey: ['/api/nodes'],
  });

  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([
    'region',
    'photo',
    'university',
    'facility',
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    '北海道',
    '東北',
    '関東',
    '中部',
    '関西',
    '中国',
    '四国',
    '九州',
  ]);
  const [actualQuestionCount, setActualQuestionCount] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // フィルタリング：選択された問題タイプと地域に基づいてデータを絞り込む
  const validPeople = useMemo(() => {
    return people.filter(p => {
      // 地域フィルター：選択された地域に含まれるか、または地域が未設定の場合は全て含める
      const matchesRegion = selectedRegions.length === 0 || 
                            !p.region || 
                            selectedRegions.includes(p.region);
      
      if (!matchesRegion) return false;
      
      // 選択された問題タイプのいずれかで有効なデータがあればOK
      const hasPhoto = selectedQuestionTypes.includes('photo') && p.photoUrl;
      const hasUniversity = selectedQuestionTypes.includes('university') && p.graduationUniversity;
      const hasFacility = selectedQuestionTypes.includes('facility') && p.facilityName;
      const hasRegion = selectedQuestionTypes.includes('region') && p.region;
      
      return hasPhoto || hasUniversity || hasFacility || hasRegion;
    });
  }, [people, selectedQuestionTypes, selectedRegions]);

  // クイズ問題を生成（quizStateが'quiz'の時だけ生成）
  const questions = useMemo<QuizQuestion[]>(() => {
    if (validPeople.length < 4 || quizState !== 'quiz' || selectedQuestionTypes.length === 0) return [];
    
    const shuffled = [...validPeople].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    return selected.map((person) => {
      // 問題タイプを決定（選択された問題タイプの中で、その人物が持っているデータに基づく）
      const availableTypes: QuestionType[] = [];
      if (selectedQuestionTypes.includes('photo') && person.photoUrl) availableTypes.push('photo');
      if (selectedQuestionTypes.includes('university') && person.graduationUniversity) availableTypes.push('university');
      if (selectedQuestionTypes.includes('facility') && person.facilityName) availableTypes.push('facility');
      if (selectedQuestionTypes.includes('region') && person.region) availableTypes.push('region');
      
      // 利用可能なタイプからランダムに選択
      const type = availableTypes.length > 0 
        ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
        : 'region'; // フォールバック

      // 選択肢を生成（正解 + 3つの不正解）
      const otherPeople = validPeople.filter(p => p.id !== person.id);
      const shuffledOthers = otherPeople.sort(() => Math.random() - 0.5);
      const wrongAnswers = shuffledOthers.slice(0, 3);
      const options = [person, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return { person, type, options };
    });
  }, [validPeople, questionCount, quizState, selectedQuestionTypes]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleStart = (count: number) => {
    setQuestionCount(count);
    setQuizState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    
    // 実際の問題数を計算して保存（次の再レンダリング後にquestionsが生成される）
    const availableCount = Math.min(count, validPeople.length);
    setActualQuestionCount(availableCount);
  };

  const handleAnswer = (answerId: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answerId);
    setShowResult(true);
    
    if (answerId === currentQuestion.person.id) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizState('result');
    }
  };

  const handleRestart = () => {
    setQuizState('setup');
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedQuestionTypes.includes(type)) {
      // 少なくとも1つは選択されている必要がある
      if (selectedQuestionTypes.length > 1) {
        setSelectedQuestionTypes(selectedQuestionTypes.filter(t => t !== type));
      }
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, type]);
    }
  };

  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      // 少なくとも1つは選択されている必要がある
      if (selectedRegions.length > 1) {
        setSelectedRegions(selectedRegions.filter(r => r !== region));
      }
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const getQuestionText = () => {
    if (!currentQuestion) return '';
    
    switch (currentQuestion.type) {
      case 'photo':
        return 'この写真の人物は誰ですか？';
      case 'university':
        return `「${currentQuestion.person.graduationUniversity}」出身の人物は誰ですか？`;
      case 'facility':
        return `「${currentQuestion.person.facilityName}」に所属している人物は誰ですか？`;
      case 'region':
        return `「${currentQuestion.person.region}」の人物は誰ですか？`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="space-y-4">
          <Skeleton className="h-64 w-96" />
          <Skeleton className="h-12 w-96" />
        </div>
      </div>
    );
  }

  if (validPeople.length < 4) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-bold">データ不足</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              クイズを開始するには、少なくとも4名以上のデータが必要です。
              名鑑ページから人物を追加してください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // セットアップ画面
  if (quizState === 'setup') {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="heading-quiz">血液内科クイズ</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              写真や大学名から教授を当てるクイズです
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-medium">
                対象地域を選択してください
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州'].map((region) => (
                  <div key={region} className="flex items-center gap-2">
                    <Checkbox
                      id={`region-${region}`}
                      checked={selectedRegions.includes(region)}
                      disabled={selectedRegions.length === 1 && selectedRegions.includes(region)}
                      onCheckedChange={() => toggleRegion(region)}
                      data-testid={`checkbox-region-${region}`}
                    />
                    <Label 
                      htmlFor={`region-${region}`} 
                      className={selectedRegions.length === 1 && selectedRegions.includes(region) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer text-sm'}
                    >
                      {region}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">
                問題タイプを選択してください
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-region"
                    checked={selectedQuestionTypes.includes('region')}
                    disabled={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('region')}
                    onCheckedChange={() => toggleQuestionType('region')}
                    data-testid="checkbox-type-region"
                  />
                  <Label 
                    htmlFor="type-region" 
                    className={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('region') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  >
                    地域
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-photo"
                    checked={selectedQuestionTypes.includes('photo')}
                    disabled={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('photo')}
                    onCheckedChange={() => toggleQuestionType('photo')}
                    data-testid="checkbox-type-photo"
                  />
                  <Label 
                    htmlFor="type-photo" 
                    className={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('photo') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  >
                    写真（写真があるもののみ）
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-university"
                    checked={selectedQuestionTypes.includes('university')}
                    disabled={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('university')}
                    onCheckedChange={() => toggleQuestionType('university')}
                    data-testid="checkbox-type-university"
                  />
                  <Label 
                    htmlFor="type-university" 
                    className={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('university') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  >
                    大学名
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="type-facility"
                    checked={selectedQuestionTypes.includes('facility')}
                    disabled={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('facility')}
                    onCheckedChange={() => toggleQuestionType('facility')}
                    data-testid="checkbox-type-facility"
                  />
                  <Label 
                    htmlFor="type-facility" 
                    className={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes('facility') ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  >
                    施設名
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">
                問題数を選択してください
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleStart(1)}
                  className="h-20 text-lg"
                  disabled={selectedQuestionTypes.length === 0 || validPeople.length < 4}
                  data-testid="button-start-1"
                >
                  1問
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleStart(5)}
                  className="h-20 text-lg"
                  disabled={selectedQuestionTypes.length === 0 || validPeople.length < 4}
                  data-testid="button-start-5"
                >
                  5問
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleStart(10)}
                  className="h-20 text-lg"
                  disabled={selectedQuestionTypes.length === 0 || validPeople.length < 4}
                  data-testid="button-start-10"
                >
                  10問
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // クイズ画面
  if (quizState === 'quiz' && currentQuestion) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" data-testid="text-question-number">
                問題 {currentQuestionIndex + 1} / {questions.length}
              </Badge>
              <Badge variant="secondary" data-testid="text-current-score">
                スコア: {score}
              </Badge>
            </div>
            <h2 className="text-xl font-bold mt-4" data-testid="text-question">
              {getQuestionText()}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.type === 'photo' && currentQuestion.person.photoUrl && (
              <div className="flex justify-center">
                <Avatar className="w-48 h-48">
                  <AvatarImage src={currentQuestion.person.photoUrl} />
                  <AvatarFallback className="text-4xl">
                    {currentQuestion.person.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.id === currentQuestion.person.id;
                const shouldHighlight = showResult && (isSelected || isCorrect);
                
                let variant: 'default' | 'outline' | 'destructive' | 'secondary' = 'outline';
                if (showResult && isCorrect) {
                  variant = 'default';
                } else if (showResult && isSelected && !isCorrect) {
                  variant = 'destructive';
                }

                // 問題タイプに応じて表示する情報を制御
                const getOptionDetails = () => {
                  if (!showResult) {
                    // 回答前は問題のヒントになる情報を隠す
                    if (currentQuestion.type === 'facility') {
                      // 施設名の問題では施設名を隠す
                      return option.position || '';
                    } else if (currentQuestion.type === 'university') {
                      // 大学名の問題では大学名を隠す（施設と役職は表示）
                      return `${option.facilityName || ''} ${option.position ? `・${option.position}` : ''}`.trim();
                    } else if (currentQuestion.type === 'region') {
                      // 地域の問題では地域を隠す（施設と役職は表示）
                      return `${option.facilityName || ''} ${option.position ? `・${option.position}` : ''}`.trim();
                    } else {
                      // 写真問題では施設と役職を表示
                      return `${option.facilityName || ''} ${option.position ? `・${option.position}` : ''}`.trim();
                    }
                  } else {
                    // 回答後は全て表示（大学名、施設名、役職、地域）
                    const parts = [
                      option.graduationUniversity,
                      option.facilityName,
                      option.position,
                      option.region,
                    ].filter(Boolean);
                    return parts.join(' ・ ');
                  }
                };

                return (
                  <Button
                    key={option.id}
                    variant={variant}
                    size="lg"
                    onClick={() => handleAnswer(option.id)}
                    disabled={showResult}
                    className="justify-start h-auto py-4 px-4"
                    data-testid={`button-option-${option.id}`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={currentQuestion.type === 'photo' && !showResult ? '' : option.photoUrl || ''} />
                        <AvatarFallback>{option.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{option.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getOptionDetails()}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {showResult && (
              <div className="text-center">
                {selectedAnswer === currentQuestion.person.id ? (
                  <Badge className="text-lg py-2 px-4" data-testid="text-result-correct">
                    ✓ 正解！
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-lg py-2 px-4" data-testid="text-result-incorrect">
                    ✗ 不正解
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleNext}
              disabled={!showResult}
              className="w-full"
              size="lg"
              data-testid="button-next"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  次の問題へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  結果を見る
                  <Trophy className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 結果画面
  if (quizState === 'result') {
    const totalQuestions = actualQuestionCount;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="heading-result">クイズ終了！</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-primary" data-testid="text-final-score">
                {score} / {totalQuestions}
              </div>
              <div className="text-2xl text-muted-foreground" data-testid="text-percentage">
                正解率: {percentage}%
              </div>
            </div>

            <div className="text-center">
              {percentage === 100 && (
                <Badge className="text-lg py-2 px-4">完璧です</Badge>
              )}
              {percentage >= 80 && percentage < 100 && (
                <Badge className="text-lg py-2 px-4">素晴らしい</Badge>
              )}
              {percentage >= 60 && percentage < 80 && (
                <Badge variant="secondary" className="text-lg py-2 px-4">良くできました</Badge>
              )}
              {percentage < 60 && (
                <Badge variant="outline" className="text-lg py-2 px-4">もう一度挑戦</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              onClick={handleRestart}
              variant="outline"
              size="lg"
              className="flex-1"
              data-testid="button-restart"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度
            </Button>
            <Button
              onClick={handleRestart}
              size="lg"
              className="flex-1"
              data-testid="button-new-quiz"
            >
              新しいクイズ
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
}
