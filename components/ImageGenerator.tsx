
import React, { useState } from 'react';
import { imageService } from '../services/gemini';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Maximize2,
  Layers,
  Layout,
  ChevronRight,
  Loader2
} from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [ratio, setRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await imageService.generateImage(prompt, ratio);
      setImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-zinc-950 overflow-hidden">
      {/* Controls */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-8 bg-zinc-950/50">
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 brand">
            <Sparkles className="text-indigo-400" size={20} />
            Studio
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your imagination..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 min-h-[120px] focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1:1', '16:9', '9:16'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                      ratio === r 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={!prompt.trim() || isGenerating}
          className={`mt-auto w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            !prompt.trim() || isGenerating
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] active:scale-95 shadow-indigo-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Magic
            </>
          )}
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-6 md:p-12 flex items-center justify-center bg-zinc-900/30">
        {!image && !isGenerating ? (
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl mx-auto flex items-center justify-center text-zinc-600 border border-zinc-700 border-dashed">
              <Layout size={32} />
            </div>
            <h3 className="text-zinc-400 font-semibold">Ready to create?</h3>
            <p className="text-zinc-600 text-sm">Enter a detailed prompt and watch Nexus bring your ideas to life with AI-driven visuals.</p>
          </div>
        ) : isGenerating ? (
          <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 w-full max-w-2xl aspect-square flex items-center justify-center bg-zinc-900">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent animate-pulse" />
             <div className="text-center z-10">
               {/* Added missing Loader2 import fix */}
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
               <p className="text-indigo-400 font-medium tracking-wide">Processing Pixels...</p>
             </div>
          </div>
        ) : (
          <div className="relative group max-w-4xl w-full">
            <img 
              src={image!} 
              alt="Generated content" 
              className="rounded-3xl shadow-2xl border border-white/10 w-full max-h-[70vh] object-contain"
            />
            
            <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-3 bg-zinc-950/80 backdrop-blur-md rounded-xl border border-zinc-700 hover:bg-zinc-900 transition-all text-white">
                <Maximize2 size={20} />
              </button>
              <a 
                href={image!} 
                download="nexus-generation.png"
                className="p-3 bg-zinc-950/80 backdrop-blur-md rounded-xl border border-zinc-700 hover:bg-zinc-900 transition-all text-white"
              >
                <Download size={20} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
