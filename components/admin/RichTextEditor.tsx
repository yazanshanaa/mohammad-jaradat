'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon,
  Heading2, Heading3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[180px] px-4 py-3 focus:outline-none',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('رابط الصورة:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt('رابط الصفحة:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  const tools: Array<{
    label: string;
    icon: React.ElementType;
    action: () => void;
    isActive?: boolean;
  }> = [
    { label: 'عريض', icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { label: 'مائل', icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { label: 'عنوان 2', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { label: 'عنوان 3', icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
    { label: 'قائمة', icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { label: 'قائمة مرقمة', icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
    { label: 'رابط', icon: Link2, action: setLink, isActive: editor.isActive('link') },
    { label: 'صورة', icon: ImageIcon, action: addImage },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5"
        style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}
      >
        {tools.map(({ label, icon: Icon, action, isActive }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            title={label}
            onClick={action}
            className="h-7 w-7 p-0 rounded"
            style={{
              backgroundColor: isActive ? 'rgba(245,166,35,0.15)' : undefined,
              color: isActive ? '#F5A623' : undefined,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
