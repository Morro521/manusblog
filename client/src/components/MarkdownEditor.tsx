import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "输入 Markdown 内容...",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border border-purple-500/20">
          <TabsTrigger value="edit" className="data-[state=active]:bg-purple-500/30">
            ✏️ 编辑
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-500/30">
            👁️ 预览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-96 bg-slate-800 border border-purple-500/20 rounded-lg p-4 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          />
          <div className="text-sm text-gray-400">
            💡 支持 Markdown 语法，包括代码块、表格、列表等
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6 min-h-96 prose prose-invert max-w-none">
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold text-cyan-400 mb-4 mt-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold text-purple-400 mb-3 mt-5" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-pink-400 mb-2 mt-4" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
                  ),
                  code: ({ node, inline, className, children, ...props }: any) =>
                    inline ? (
                      <code className="bg-slate-900 text-cyan-400 px-2 py-1 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-slate-900 text-gray-300 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                        {children}
                      </code>
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-cyan-400 pl-4 py-2 italic text-gray-400 mb-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table className="w-full border-collapse border border-purple-500/30 mb-4" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-purple-500/30 bg-slate-900 text-cyan-400 p-2 text-left" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-purple-500/30 p-2 text-gray-300" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-cyan-400 hover:text-purple-400 underline" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img className="max-w-full h-auto rounded-lg my-4" {...props} />
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <div className="text-gray-500 text-center py-12">预览内容将显示在这里...</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
