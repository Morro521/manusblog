import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import ImageUpload from "./ImageUpload";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowImageUpload?: boolean;
}

export default function MarkdownEditor({ value, onChange, placeholder = "从这里开始。", allowImageUpload = true }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const insertImage = (url: string) => {
    if (!url) return;
    const imageMarkdown = `![image](${url})`;
    onChange(value.trimEnd() ? `${value.trimEnd()}\n\n${imageMarkdown}\n` : `${imageMarkdown}\n`);
  };

  return <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.13] bg-white/[0.045] px-3 py-2.5 sm:px-4"><div className="flex items-center gap-4"><TabsList className="h-auto rounded-xl bg-[#15191f] p-1"><TabsTrigger value="edit" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 data-[state=active]:bg-[#bce8eb] data-[state=active]:text-[#152126]">编辑</TabsTrigger><TabsTrigger value="preview" className="rounded-lg px-3 py-1.5 text-xs text-slate-300 data-[state=active]:bg-[#bce8eb] data-[state=active]:text-[#152126]">预览</TabsTrigger></TabsList>{allowImageUpload && <ImageUpload onUpload={insertImage} compact />}</div><span className="text-xs text-slate-400">{value.length.toLocaleString()} 字</span></div>
    <TabsContent value="edit" className="mt-0"><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} spellCheck className="mt-4 min-h-[440px] w-full resize-y rounded-2xl border border-white/[0.12] bg-[#1b2028]/72 px-5 py-6 font-serif text-[17px] leading-9 text-slate-100 shadow-inner shadow-black/10 placeholder:text-slate-400 focus:border-[#bce8eb] focus:outline-none focus:ring-4 focus:ring-[#bce8eb]/10 sm:min-h-[640px] sm:px-7 sm:py-8" /><p className="mt-3 px-1 text-xs leading-6 text-slate-400">支持 Markdown。可用 <span className="font-mono text-slate-200">#</span> 写标题、<span className="font-mono text-slate-200">```</span> 插入代码块；上传图片后会自动插入到文末。</p></TabsContent>
    <TabsContent value="preview" className="mt-0"><div className="prose-cosmic mt-4 min-h-[640px] rounded-2xl border border-white/[0.12] bg-[#1b2028]/72 px-5 py-7 shadow-inner shadow-black/10 sm:px-7 sm:py-9">{value ? <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ h1: ({ node, ...props }) => <h1 className="mb-6 mt-12 text-3xl" {...props} />, h2: ({ node, ...props }) => <h2 className="mb-5 mt-10 text-2xl" {...props} />, h3: ({ node, ...props }) => <h3 className="mb-4 mt-8 text-xl" {...props} />, p: ({ node, ...props }) => <p className="mb-7" {...props} />, code: ({ node, inline, children, ...props }: any) => inline ? <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-sm" {...props}>{children}</code> : <code {...props}>{children}</code>, pre: ({ node, ...props }) => <pre className="mb-8 overflow-x-auto p-5 text-sm leading-7" {...props} />, blockquote: ({ node, ...props }) => <blockquote className="mb-8 italic" {...props} />, ul: ({ node, ...props }) => <ul className="mb-7 list-disc space-y-2 pl-6" {...props} />, ol: ({ node, ...props }) => <ol className="mb-7 list-decimal space-y-2 pl-6" {...props} />, table: ({ node, ...props }) => <div className="mb-8 overflow-x-auto"><table className="w-full border-collapse text-sm" {...props} /></div>, th: ({ node, ...props }) => <th className="border border-white/15 bg-white/[0.04] p-3 text-left font-sans text-[#bce8eb]" {...props} />, td: ({ node, ...props }) => <td className="border border-white/10 p-3" {...props} />, a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />, img: ({ node, ...props }) => <img className="my-9 w-full rounded-xl border border-white/10" loading="lazy" {...props} /> }}>{value}</ReactMarkdown> : <div className="grid min-h-[520px] place-items-center text-center"><div><p className="text-sm font-medium text-slate-200">预览会显示在这里</p><p className="mt-3 text-sm text-slate-400">写下第一句后，就可以切换到预览查看排版。</p></div></div>}</div></TabsContent>
  </Tabs>;
}
