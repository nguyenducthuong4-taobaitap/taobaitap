import React, { useRef, useState } from 'react';
import { GRADES, QUESTION_TYPES, DIFFICULTIES, QUESTION_COUNTS, SUBJECTS, LIT_PAGE_COUNTS, PLACEHOLDER_LESSON } from '../constants';
import { ExamRequest, QuestionType, AppMode } from '../types';
import mammoth from 'mammoth';

interface InputFormProps {
  request: ExamRequest;
  onChange: (field: keyof ExamRequest, value: string | number) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  request,
  onChange,
  onSubmit,
  isGenerating,
}) => {
  const isPracticeMode = request.mode === AppMode.Practice;

  const isLiterature = request.subject === 'Ngữ văn / Tiếng Việt';
  const isEssayType = request.type === QuestionType.Essay;

  const isValidToSubmit = isPracticeMode 
    ? !!request.topic.trim() 
    : !!request.lessonContent?.trim();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a docx file
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        alert("Vui lòng chọn file Word (.docx)");
        return;
    }

    setIsReadingFile(true);
    setFileName(file.name);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        // Update the lessonContent with extracted text
        onChange('lessonContent', result.value);
        
        if (result.messages.length > 0) {
            console.log("Mammoth messages:", result.messages);
        }
    } catch (error) {
        console.error("Error reading file:", error);
        alert("Có lỗi khi đọc file Word. Vui lòng thử lại hoặc copy/paste nội dung thủ công.");
        setFileName(null);
    } finally {
        setIsReadingFile(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          {isPracticeMode ? (
            <>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               Cấu hình đề thi
            </>
          ) : (
            <>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
               Thông tin giáo án
            </>
          )}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isPracticeMode 
            ? 'Hỗ trợ tất cả các môn từ Lớp 1 đến Lớp 12 (Chương trình 2018)' 
            : 'Tích hợp năng lực số vào giáo án theo chuẩn Khung NL Số Việt Nam'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Subject - Common for both modes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Môn học</label>
          <div className="relative">
            <select
              value={request.subject}
              onChange={(e) => onChange('subject', e.target.value)}
              className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Grade - Common for both modes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Khối Lớp</label>
          <div className="relative">
            <select
              value={request.grade}
              onChange={(e) => onChange('grade', e.target.value)}
              className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
            >
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* PRACTICE MODE SPECIFIC FIELDS */}
        {isPracticeMode && (
          <>
            {/* Topic */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Chủ đề (Nội dung kiến thức)</label>
              <input
                type="text"
                value={request.topic}
                onChange={(e) => onChange('topic', e.target.value)}
                placeholder="Ví dụ: Phép cộng trong phạm vi 100, Câu đơn, Thì hiện tại đơn, Tình yêu quê hương..."
                className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm"
              />
            </div>

            {/* Specific Requirements */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Dạng bài tập / Yêu cầu cụ thể (Tùy chọn)
              </label>
              <textarea
                value={request.specificRequirements || ''}
                onChange={(e) => onChange('specificRequirements', e.target.value)}
                placeholder="Ví dụ: Tập trung vào phân tích nhân vật... (Để trống nếu muốn bao quát cả chủ đề)"
                rows={2}
                className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm resize-none"
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Loại câu hỏi</label>
              <div className="relative">
                <select
                  value={request.type}
                  onChange={(e) => onChange('type', e.target.value)}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Conditional Fields based on Subject/Type */}
            {isLiterature || isEssayType ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Độ dài bài văn mẫu (Dự kiến)</label>
                <div className="relative">
                  <select
                    value={request.literaturePageCount || 2}
                    onChange={(e) => onChange('literaturePageCount', parseInt(e.target.value))}
                    className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
                  >
                    {LIT_PAGE_COUNTS.map((c) => (
                      <option key={c} value={c}>{c} trang (Khoảng {c * 400}-{c * 500} từ)</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Mức độ</label>
                  <div className="relative">
                    <select
                      value={request.difficulty}
                      onChange={(e) => onChange('difficulty', e.target.value)}
                      className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Số lượng câu hỏi</label>
                  <div className="relative">
                    <select
                      value={request.questionCount}
                      onChange={(e) => onChange('questionCount', parseInt(e.target.value))}
                      className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border transition-shadow shadow-sm appearance-none"
                    >
                      {QUESTION_COUNTS.map((count) => (
                        <option key={count} value={count}>{count} câu</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* LESSON PLAN MODE SPECIFIC FIELDS */}
        {!isPracticeMode && (
          <div className="space-y-4 md:col-span-2">
             <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-slate-700">
                  Tài liệu đầu vào (File Word giáo án)
                </label>
                
                {/* File Upload Area */}
                <div 
                   onClick={triggerFileUpload}
                   className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group
                   ${fileName ? 'border-green-300 bg-green-50' : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400'}`}
                >
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileUpload} 
                     accept=".docx,.doc" 
                     className="hidden" 
                   />
                   
                   {isReadingFile ? (
                     <div className="flex flex-col items-center animate-pulse">
                        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-indigo-700 font-medium">Đang đọc file...</p>
                     </div>
                   ) : fileName ? (
                     <div className="flex flex-col items-center">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <p className="text-sm font-semibold text-green-800">{fileName}</p>
                        <p className="text-xs text-green-600 mt-1">Nhấn để thay đổi file khác</p>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Tải file giáo án (.docx)</p>
                        <p className="text-xs text-slate-400 mt-1">Hoặc kéo thả file vào đây</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Extracted Content Preview (Collapsible or just visible for editing) */}
             <div className="space-y-1">
                <div className="flex justify-between items-end">
                   <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                     Nội dung trích xuất (Có thể chỉnh sửa)
                   </label>
                </div>
                <textarea
                  value={request.lessonContent || ''}
                  onChange={(e) => onChange('lessonContent', e.target.value)}
                  placeholder={PLACEHOLDER_LESSON}
                  rows={8}
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs border transition-shadow shadow-sm font-mono"
                />
             </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={isGenerating || !isValidToSubmit}
          className={`w-full flex items-center justify-center py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg ${
            isGenerating || !isValidToSubmit
              ? 'bg-slate-400 cursor-not-allowed'
              : isPracticeMode 
                ? 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.99]'
                : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isPracticeMode ? 'Đang khởi tạo đề thi...' : 'Đang soạn giáo án...'}
            </>
          ) : (
             isPracticeMode ? 'Tạo Đề Thi Ngay' : 'Bắt Đầu Soạn Giáo Án'
          )}
        </button>
      </div>
    </div>
  );
};