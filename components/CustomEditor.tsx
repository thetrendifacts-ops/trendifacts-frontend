"use client";

import { useEffect, useRef, useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (data: string) => void;
}

declare global {
  interface Window {
    ClassicEditor: any;
  }
}

class CloudinaryUploadAdapter {
  loader: any;
  
  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.url) {
              resolve({ default: data.url });
            } else {
              reject(data.error);
            }
          })
          .catch((err) => {
            reject("Upload failed");
            console.error(err);
          });
      });
    });
  }

  abort() {}
}

function CustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    return new CloudinaryUploadAdapter(loader);
  };
}

export default function CustomEditor({ value, onChange }: EditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [wordCountLabel, setWordCountLabel] = useState("📊 Word Count");
  const [cardData, setCardData] = useState({
    title: '',
    badge: 'Top Pick',
    image: '',
    link: ''
  });

  // Load CKEditor 5 Classic from official CDN
  useEffect(() => {
    if (window.ClassicEditor) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize CKEditor once script is loaded
  useEffect(() => {
    if (!scriptLoaded || !editorContainerRef.current || editorInstance) return;

    window.ClassicEditor.create(editorContainerRef.current, {
      extraPlugins: [CustomUploadAdapterPlugin],
      toolbar: [
        'heading', '|',
        'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
        'uploadImage', 'insertTable', 'blockQuote', 'undo', 'redo'
      ],
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
        ]
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      }
    })
      .then((editor: any) => {
        editor.setData(value || '');
        setEditorInstance(editor);
        editor.model.document.on('change:data', () => {
          onChange(editor.getData());
        });
      })
      .catch((err: any) => console.error('CKEditor init error:', err));
  }, [scriptLoaded]);

  // Sync external value changes (e.g., when loading an existing post to edit)
  useEffect(() => {
    if (editorInstance && value !== editorInstance.getData()) {
      editorInstance.setData(value || '');
    }
  }, [value, editorInstance]);

  const handleWordCount = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentContent = editorInstance ? editorInstance.getData() : value;
    const plainText = currentContent
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\[.*?\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const count = plainText ? plainText.split(/\s+/).length : 0;
    setWordCountLabel(`📊 ${count} Words`);
    setTimeout(() => {
      setWordCountLabel("📊 Word Count");
    }, 4000);
  };

  const insertShortcode = (type: string) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const insertPosition = editorInstance.model.document.selection.getFirstPosition();
      let textToInsert = "";

      if (type === "winner") {
        textToInsert = "\n[WINNER_BOX || The Short Answer || Type your quick verdict here.]\n";
      } else if (type === "bounty") {
        textToInsert = "\n[BOUNTY_BUTTON || Unlock 6 Months Free ↗ || https://amzn.to/4wum3kL]\n";
      } else if (type === "quickpick") {
        textToInsert = "\n[QUICK_PICK || Product Name || State exactly why this is the best option for the buyer in 1-2 sentences. || https://www.amazon.com/dp/YOUR-LINK]\n";
      } else if (type === "calculator") {
        textToInsert = "\n[runtime-calculator]\n";
      }

      writer.insertText(textToInsert, insertPosition);
    });
  };

  const handleInsertCard = () => {
    if (!editorInstance || !cardData.title || !cardData.link) return;

    const shortcode = `\n[AMAZON_CARD || ${cardData.title} || ${cardData.badge} || ${cardData.image} || ${cardData.link}]\n`;

    editorInstance.model.change((writer: any) => {
      const insertPosition = editorInstance.model.document.selection.getFirstPosition();
      writer.insertText(shortcode, insertPosition);
    });

    setCardData({ title: '', badge: 'Top Pick', image: '', link: '' });
    setShowBuilder(false);
  };

  return (
    <div className="w-full">
      {/* AFFILIATE TOOLS PANEL */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
        <div className="p-3 bg-gray-100 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-700 mr-2">🛠 Content Tools:</span>
            
            <button
              onClick={handleWordCount}
              className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-xs hover:bg-indigo-50 font-bold shadow-sm transition-all duration-300 min-w-[110px]"
            >
              {wordCountLabel}
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                insertShortcode("quickpick");
              }}
              className="px-3 py-1.5 bg-white border-2 border-amber-400 text-amber-900 rounded-lg text-xs hover:bg-amber-50 font-extrabold shadow-sm transition-colors"
            >
              ⚡ Quick Pick
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                insertShortcode("winner");
              }}
              className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 rounded-lg text-xs hover:bg-amber-50 font-bold shadow-sm transition-colors"
            >
              🏆 Winner Box
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                insertShortcode("bounty");
              }}
              className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 rounded-lg text-xs hover:bg-amber-50 font-bold shadow-sm transition-colors"
            >
              💰 Bounty Button
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                insertShortcode("calculator");
              }}
              className="px-3 py-1.5 bg-slate-900 text-emerald-400 rounded-lg text-xs hover:bg-slate-800 font-bold shadow-sm transition-colors"
            >
              🔋 Runtime Calc
            </button>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              setShowBuilder(!showBuilder);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            {showBuilder ? "Close Builder" : "📦 Build Amazon Card"}
          </button>
        </div>

        {showBuilder && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-t border-gray-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Product Title</label>
              <input 
                type="text" 
                value={cardData.title} 
                onChange={e => setCardData({...cardData, title: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-amber-500" 
                placeholder="e.g. EcoFlow DELTA 2 Portable Power Station" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Badge (Optional)</label>
              <input 
                type="text" 
                value={cardData.badge} 
                onChange={e => setCardData({...cardData, badge: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-amber-500" 
                placeholder="e.g. Best for Home Backup" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Image URL</label>
              <input 
                type="text" 
                value={cardData.image} 
                onChange={e => setCardData({...cardData, image: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-amber-500" 
                placeholder="https://m.media-amazon.com/..." 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Amazon Affiliate Link</label>
              <input 
                type="text" 
                value={cardData.link} 
                onChange={e => setCardData({...cardData, link: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:border-amber-500" 
                placeholder="https://www.amazon.com/dp/..." 
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleInsertCard();
                }} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Insert Card at Cursor
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-3 italic">
        * <strong>Need a comparison table?</strong> Just click the standard Table icon inside the CKEditor toolbar below. The site will style it automatically!
      </p>

      {/* CKEDITOR CONTAINER */}
      <div className="prose max-w-none w-full bg-white text-gray-800 border border-gray-200 rounded-lg overflow-hidden min-h-[350px]">
        {!scriptLoaded && <div className="p-6 text-slate-400">Loading Trendifacts Custom Editor...</div>}
        <div ref={editorContainerRef} />
      </div>
    </div>
  );
}