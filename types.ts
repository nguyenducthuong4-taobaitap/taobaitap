export enum Grade {
  Grade1 = '1',
  Grade2 = '2',
  Grade3 = '3',
  Grade4 = '4',
  Grade5 = '5',
  Grade6 = '6',
  Grade7 = '7',
  Grade8 = '8',
  Grade9 = '9',
  Grade10 = '10',
  Grade11 = '11',
  Grade12 = '12',
}

export enum QuestionType {
  MultipleChoice = 'Trắc nghiệm 4 phương án',
  TrueFalse = 'Đúng-Sai',
  ShortAnswer = 'Trả lời ngắn',
  Essay = 'Bài tự luận (Viết văn)',
  Mixed = 'Kết hợp',
}

export enum Difficulty {
  Recall = 'Nhận biết',
  Understanding = 'Thông hiểu',
  Application = 'Vận dụng',
  AdvancedApplication = 'Vận dụng cao',
  Mixed = 'Kết hợp',
}

// Literature specific types
export enum LiteratureAnswerType {
  Outline = 'Dàn ý gợi ý',
  FullEssay = 'Bài văn hoàn chỉnh',
}

export type LiteraturePageCount = 1 | 2 | 3 | 4 | 5;

export enum AppMode {
  Practice = 'practice',
  LessonPlan = 'lesson_plan',
}

export interface ExamRequest {
  mode: AppMode;
  subject: string;
  grade: Grade;
  // Practice Mode Fields
  topic: string;
  specificRequirements?: string;
  type: QuestionType;
  difficulty: Difficulty;
  questionCount: number;
  literatureAnswerType?: LiteratureAnswerType;
  literaturePageCount?: LiteraturePageCount;
  // Lesson Plan Mode Fields
  lessonContent?: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}