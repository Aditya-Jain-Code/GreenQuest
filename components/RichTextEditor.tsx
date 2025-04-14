"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type RichTextEditorProps = {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Write something...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
      <div className="flex border-b border-gray-300 p-2 space-x-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor?.isActive("bold") ? "bg-gray-200" : ""
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor?.isActive("italic") ? "bg-gray-200" : ""
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor?.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          • List
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[200px] p-4 prose max-w-none focus:outline-none"
      />
    </div>
  );
}
