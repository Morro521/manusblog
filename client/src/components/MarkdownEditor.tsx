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

export default function MarkdownEditor({ value, onChange, placeholder = "输入 Markdown 内容…", allowImageUpload = true }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const insertImage = (url: string) => {
    if (!url) return;
    const imageMarkdown = `![uploaded image](${url})`;
    onChange(value.trimEnd() ? `${value.trimEnd()}\n\n${imageMarkdown}\n` : `${imageMarkdown}\n`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between border-b border-white/[0.12] pb-3"><TabsList className="h-auto rounded-none bg-transparent p-0"><TabsTrigger value="edit" className="rounded-none border-b-2 border-transparent px-0 pr-5 pb-2 pt-0 font-mono text-[11px] tracking-[0.12em] text-stone-500 data-[state=active]:border-[#c6edf0] data-[state=active]:bg-transparent data-[state=active]:text-[#c6edf0]">WRITE</TabsTrigger><TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 font-mono text-[11px] tracking-[0.12em] text-stone-500 data-[state=active]:border-[#c6edf0] data-[state=active]:bg-transparent data-[state=active]:text-[#c6edf0]">PREVIEW</TabsTrigger></TabsList><p className="font-mono text-[10px] tracking-[0.1em] text-stone-600">MARKDOWN ENABLED</p></div>
      <TabsContent value="edit" className="mt-0"><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="quiet-input min-h-[420px] w-full resize-y border-x-0 border-t-0 p-4 font-mono text-sm leading-7 placeholder:text-stone-700 focus-visible:ring-0" />{allowImageUpload && <div className="mt-6 border-t border-white/[0.12] pt-5"><ImageUpload onUpload={insertImage} label="INSERT IMAGE INTO MANUSCRIPT" /></div>}<p className="mt-4 text-xs leading-6 text-stone-600">支持 GitHub Flavored Markdown、表格、代码块与图片。图片上传后会插入到当前文稿末尾。</p></TabsContent>
      <TabsContent value="preview" className="mt-0"><div className="prose-cosmic min-h-[420px] border-b border-white/[0.12] px-1 py-8">{value ? <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ h1: ({ node, ...props }) => <h1 className="mb-6 mt-12 text-3xl" {...props} />, h2: ({ node, ...props }) => <h2 className="mb-5 mt-10 text-2xl" {...props} />, h3: ({ node, ...props }) => <h3 className="mb-4 mt-8 text-xl" {...props} />, p: ({ node, ...props }) => <p className="mb-7" {...props} />, code: ({ node, inline, children, ...props }: any) => inline ? <code className="bg-white/[0.06] px-1.5 py-0.5 text-sm" {...props}>{children}</code> : <code {...props}>{children}</code>, pre: ({ node, ...props }) => <pre className="mb-8 overflow-x-auto p-5 text-sm leading-7" {...props} />, blockquote: ({ node, ...props }) => <blockquote className="mb-8 italic" {...props} />, ul: ({ node, ...props }) => <ul className="mb-7 list-disc space-y-2 pl-6" {...props} />, ol: ({ node, ...props }) => <ol className="mb-7 list-decimal space-y-2 pl-6" {...props} />, table: ({ node, ...props }) => <div className="mb-8 overflow-x-auto"><table className="w-full border-collapse text-sm" {...props} /></div>, th: ({ node, ...props }) => <th className="border border-white/15 bg-white/[0.04] p-3 text-left font-sans text-[#c6edf0]" {...props} />, td: ({ node, ...props }) => <td className="border border-white/10 p-3" {...props} />, a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />, img: ({ node, ...props }) => <img className="my-9 w-full border border-white/10" loading="lazy" {...props} /> }}>{value}</ReactMarkdown> : <div className="grid min-h-80 place-items-center text-center"><div><p className="editorial-kicker">NO MANUSCRIPT YET</p><p className="mt-3 text-sm text-stone-600">预览会在这里出现。</p></div></div>}</div></TabsContent>
    </Tabs>
  );
}
