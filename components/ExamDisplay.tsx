import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from "docx";

interface ExamDisplayProps {
  content: string;
}

export const ExamDisplay: React.FC<ExamDisplayProps> = ({ content }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Parse the content. If "Part 2" marker exists, split it. Otherwise (Lesson Plan), treat as one.
  const { questionsPart, answersPart, isLessonPlan } = useMemo(() => {
    const part2Marker = "### PHẦN 2: ĐÁP ÁN VÀ HƯỚNG DẪN CHI TIẾT"; // Matches the system instruction header
    const altPart2Marker = "### PHẦN 2: ĐÁP ÁN VÀ LỜI GIẢI"; // Fallback
    
    // Check for standard Exam structure
    let splitIndex = content.indexOf(part2Marker);
    let usedMarker = part2Marker;

    if (splitIndex === -1) {
       splitIndex = content.indexOf(altPart2Marker);
       usedMarker = altPart2Marker;
    }
    
    if (splitIndex !== -1) {
      const part1 = content.substring(0, splitIndex);
      const part2 = content.substring(splitIndex);
      return {
        questionsPart: part1.trim(),
        answersPart: part2.trim(),
        isLessonPlan: false
      };
    }
    
    // If no marker found, assume it's a Lesson Plan or generic content
    return {
      questionsPart: content.trim(),
      answersPart: '',
      isLessonPlan: true
    };
  }, [content]);

  if (!content) return null;

  const handleDownloadWord = async () => {
    setIsDownloading(true);
    try {
      // Helper function to parse markdown lines into Docx Paragraphs with formatting
      const createParagraphsFromMarkdown = (text: string) => {
        return text.split('\n').map(line => {
          let cleanLine = line.trim();
          if (!cleanLine) return new Paragraph({ text: "" });

          // 1. Handle Headings
          let headingLevel: typeof HeadingLevel[keyof typeof HeadingLevel] | undefined = undefined;
          
          if (cleanLine.startsWith('# ')) { headingLevel = HeadingLevel.HEADING_1; cleanLine = cleanLine.substring(2); }
          else if (cleanLine.startsWith('## ')) { headingLevel = HeadingLevel.HEADING_2; cleanLine = cleanLine.substring(3); }
          else if (cleanLine.startsWith('### ')) { headingLevel = HeadingLevel.HEADING_3; cleanLine = cleanLine.substring(4); }
          else if (cleanLine.startsWith('#### ')) { headingLevel = HeadingLevel.HEADING_4; cleanLine = cleanLine.substring(5); }
          else if (cleanLine.startsWith('##### ')) { headingLevel = HeadingLevel.HEADING_5; cleanLine = cleanLine.substring(6); }

          // 2. Handle Inline Formatting (Bold/Italic)
          // Split string by bold (**...**) and italic (*...*) markers.
          // Regex captures the delimiters so we can identify them.
          // Note: This matches **bold** or *italic*. Nested formatting is not supported in this simple parser.
          const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          
          const children: TextRun[] = parts.map(part => {
             if (part.startsWith('**') && part.endsWith('**')) {
                 return new TextRun({ 
                   text: part.slice(2, -2), 
                   bold: true,
                   size: 24, // 12pt
                   font: "Times New Roman"
                 });
             } else if (part.startsWith('*') && part.endsWith('*')) {
                 return new TextRun({ 
                   text: part.slice(1, -1), 
                   italics: true,
                   size: 24,
                   font: "Times New Roman"
                 });
             } else {
                 return new TextRun({ 
                   text: part, 
                   size: 24,
                   font: "Times New Roman"
                 });
             }
          });

          return new Paragraph({
            children: children,
            heading: headingLevel,
            alignment: headingLevel === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: headingLevel ? 240 : 0, after: 120 }
          });
        });
      };

      const docChildren = [];

      if (isLessonPlan) {
        // --- LESSON PLAN DOWNLOAD ---
        // Just render the whole content preserving structure
        docChildren.push(
            new Paragraph({
              text: "GIÁO ÁN TÍCH HỢP NĂNG LỰC SỐ",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
        );
        docChildren.push(...createParagraphsFromMarkdown(questionsPart));
      } else {
        // --- EXAM DOWNLOAD ---
        // Render Questions then Answers separated by Page Break
        docChildren.push(
            new Paragraph({
              text: "ĐỀ ÔN LUYỆN - EDUGEN VN",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            })
        );
        docChildren.push(...createParagraphsFromMarkdown(questionsPart));
        
        if (answersPart) {
           docChildren.push(new Paragraph({ children: [new PageBreak()] }));
           docChildren.push(...createParagraphsFromMarkdown(answersPart));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isLessonPlan 
        ? `Giao_An_NLS_${new Date().toISOString().slice(0,10)}.docx`
        : `De_Thi_EduGen_${new Date().toISOString().slice(0,10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating Word document:", error);
      alert("Có lỗi khi tạo file Word. Vui lòng thử lại.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px] lg:h-[900px]">
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          {isLessonPlan ? 'Nội Dung Giáo Án' : 'Nội Dung Đề Thi'}
        </h3>
        <button
          onClick={handleDownloadWord}
          disabled={isDownloading}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tạo file...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Tải về Word (.docx)
            </>
          )}
        </button>
      </div>
      
      {isLessonPlan ? (
        // --- LESSON PLAN VIEW (Single Column) ---
        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 bg-white">
           <div className="prose prose-slate max-w-4xl mx-auto prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 prose-sm">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {questionsPart}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        // --- EXAM VIEW (Two Columns) ---
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-white">
          {/* Column 1: Questions */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-200 p-6 min-h-[50%] lg:min-h-full">
             <div className="sticky top-0 bg-white/95 backdrop-blur z-10 pb-2 mb-4 border-b border-slate-100">
               <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Đề Bài</span>
             </div>
             <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 prose-sm">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {questionsPart}
              </ReactMarkdown>
            </div>
          </div>

          {/* Column 2: Answers */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 min-h-[50%] lg:min-h-full">
             <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 pb-2 mb-4 border-b border-slate-100">
               <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Đáp Án & Lời Giải</span>
             </div>
             <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 prose-sm">
              {answersPart ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answersPart}
                </ReactMarkdown>
              ) : (
                 <div className="flex items-center justify-center h-40 text-slate-400 italic text-sm">
                   Đáp án sẽ hiển thị tại đây sau khi đề bài được tạo xong...
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};