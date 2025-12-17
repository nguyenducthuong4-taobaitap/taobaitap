import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ExamDisplay } from './components/ExamDisplay';
import { Grade, QuestionType, Difficulty, ExamRequest, AppMode } from './types';
import { generateExamStream } from './services/geminiService';

const App: React.FC = () => {
  const [request, setRequest] = useState<ExamRequest>({
    mode: AppMode.Practice,
    subject: 'Toán',
    grade: Grade.Grade12,
    topic: '',
    specificRequirements: '',
    type: QuestionType.Mixed,
    difficulty: Difficulty.Mixed,
    questionCount: 10,
    lessonContent: '',
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((field: keyof ExamRequest, value: string | number) => {
    setRequest((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    // Validation
    if (request.mode === AppMode.Practice && !request.topic.trim()) {
      setError('Vui lòng nhập chủ đề.');
      return;
    }
    if (request.mode === AppMode.LessonPlan && !request.lessonContent?.trim()) {
      setError('Vui lòng nhập nội dung giáo án.');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setError(null);

    // Variables for throttling
    let accumulatedText = '';
    let lastUpdateTime = 0;

    try {
      await generateExamStream(request, (chunk) => {
        accumulatedText += chunk;
        const now = Date.now();
        // Throttle UI updates to every 100ms to prevent React rendering lag
        if (now - lastUpdateTime > 100) {
          setGeneratedContent(accumulatedText);
          lastUpdateTime = now;
        }
      });
      // Ensure the final complete text is set
      setGeneratedContent(accumulatedText);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng kiểm tra API Key và thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isPractice = request.mode === AppMode.Practice;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isPractice ? 'bg-blue-600' : 'bg-indigo-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">EDUGEN VN BY NGUYỄN ĐỨC THƯƠNG</h1>
              <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">Chương trình 2018 (Lớp 1-12)</span>
            </div>
          </div>
          <div className="hidden sm:block text-sm text-slate-500">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* MODE SELECTOR */}
        <div className="flex justify-center mb-8">
           <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
             <button
               onClick={() => handleInputChange('mode', AppMode.Practice)}
               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                 isPractice 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'text-slate-600 hover:bg-slate-50'
               }`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Tạo Bài Tập Theo Chủ Đề
             </button>
             <button
               onClick={() => handleInputChange('mode', AppMode.LessonPlan)}
               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                 !isPractice 
                 ? 'bg-indigo-600 text-white shadow-md' 
                 : 'text-slate-600 hover:bg-slate-50'
               }`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Soạn Giáo Án Năng Lực Số
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-6">
            <InputForm 
              request={request}
              onChange={handleInputChange}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />

            {/* Helper Info Card - Dynamic based on Mode */}
            {isPractice ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Hướng dẫn tạo đề
                </h4>
                <ul className="text-sm text-blue-700 space-y-1.5 list-disc list-inside">
                  <li>Hỗ trợ <strong>tất cả các môn</strong> và <strong>mọi cấp học (1-12)</strong>.</li>
                  <li>Nhập chủ đề phù hợp với môn học.</li>
                  <li>Chọn <strong>Kết hợp</strong> để có cấu trúc đề chuẩn.</li>
                  <li>Hệ thống tự động điều chỉnh ngôn ngữ phù hợp lứa tuổi.</li>
                </ul>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <h4 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Hướng dẫn soạn giáo án NLS
                </h4>
                <ul className="text-sm text-indigo-700 space-y-1.5 list-disc list-inside">
                  <li>Chuẩn bị sẵn nội dung giáo án thô (Mục tiêu, Tiến trình...).</li>
                  <li>Hệ thống sẽ giữ nguyên nội dung gốc.</li>
                  <li>Tự động chèn các <strong>Mã năng lực số</strong> (VD: 1.2.NC1a) phù hợp.</li>
                  <li>Tự động đề xuất hoạt động tích hợp công nghệ.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                 {error}
              </div>
            )}
            
            {generatedContent || isGenerating ? (
              <ExamDisplay content={generatedContent} />
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <p className="font-medium">Chưa có nội dung</p>
                <p className="text-sm">Hãy cấu hình và nhấn "{isPractice ? 'Tạo Đề Thi Ngay' : 'Bắt Đầu Soạn Giáo Án'}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;