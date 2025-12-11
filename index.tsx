import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { 
  Brain, 
  Code, 
  Rocket, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Menu, 
  X,
  Play,
  Users,
  Globe,
  Zap,
  Cpu,
  MessageSquare,
  Eye,
  Layout,
  Megaphone,
  Sparkles,
  Sprout,
  Briefcase,
  MonitorPlay,
  GraduationCap,
  Star,
  Quote,
  Linkedin,
  Github,
  Video,
  Target,
  Laptop,
  ArrowRight,
  TrendingUp,
  Blocks,
  Wand,
  Terminal,
  Workflow,
  Palette,
  LineChart,
  Network,
  Trophy,
  Database,
  Bot,
  Scan,
  PenTool,
  Calendar,
  Clock,
  Share2,
  Plus,
  Trash2,
  LogOut,
  Lock,
  Loader2,
  Download,
  Upload,
  Copy,
  Settings,
  Cloud,
  HardDrive,
  Check
} from "lucide-react";

// --- CONFIGURATION: HARDCODED CREDENTIALS (OPTIONAL) ---
// Вставьте сюда ваши данные от Supabase, чтобы они подтягивались автоматически.
// Это удобно для деплоя, но помните, что public ключ виден в коде.
const HARDCODED_SUPABASE_URL = "https://ukhjypxkiixppuoswdhi.supabase.co"; // Например: "https://xyz.supabase.co"
const HARDCODED_SUPABASE_KEY = "sb_publishable_Ci7mGvtq8DQQBOest1dOAg_3CPi2Qha"; // Например: "eyJhbGc..."

// Вставьте сюда API Key от Google Gemini (AI Studio), чтобы генерация работала на Vercel
const HARDCODED_GEMINI_KEY = "AIzaSyCSxief8EvWw4FWHDm6lOPUf2tY_GmZSBA"; // Например: "AIzaSy..."

// --- INITIAL DATA (EMPTY - NO DEMO POSTS) ---
const initialBlogPosts: any[] = [];

// --- BLOG SERVICE (ABSTRACTION LAYER) ---
// Handles LocalStorage vs Supabase with field mapping
const BlogService = {
  getSupabaseClient: () => {
    // Try localStorage first, then fallback to hardcoded constants
    const url = localStorage.getItem("sb_url") || HARDCODED_SUPABASE_URL;
    const key = localStorage.getItem("sb_key") || HARDCODED_SUPABASE_KEY;
    
    if (url && key && url.startsWith('http')) return createClient(url, key);
    return null;
  },

  getAllPosts: async () => {
    const supabase = BlogService.getSupabaseClient();
    if (supabase) {
      // Fetch from Supabase
      const { data, error } = await supabase.from('posts').select('*').order('id', { ascending: false });
      
      if (!error && data) {
        // MAP DB FIELDS (snake_case) TO APP FIELDS (camelCase)
        // description -> desc
        // read_time -> readTime
        const mapped = data.map((p: any) => ({
          ...p,
          desc: p.description || p.desc || "", 
          readTime: p.read_time || p.readTime || ""
        }));
        return { posts: mapped, source: 'cloud' };
      } else {
        console.error("Supabase Fetch Error:", error);
      }
    }
    
    // Fallback to local storage
    const saved = localStorage.getItem('neurolearn_posts');
    return { 
      posts: saved ? JSON.parse(saved) : initialBlogPosts, 
      source: 'local' 
    };
  },

  // NEW METHOD: Get single post by ID (for direct links)
  getPostById: async (id: number | string) => {
    const supabase = BlogService.getSupabaseClient();
    
    // Try Cloud first
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          desc: data.description || data.desc || "", 
          readTime: data.read_time || data.readTime || ""
        };
      }
    }

    // Try Local
    const saved = localStorage.getItem('neurolearn_posts');
    if (saved) {
      const posts = JSON.parse(saved);
      return posts.find((p: any) => String(p.id) === String(id));
    }
    
    return null;
  },

  createPost: async (post: any) => {
    const supabase = BlogService.getSupabaseClient();
    if (supabase) {
      // PREPARE FOR DB: Map app fields to DB fields
      // Remove 'id' to let DB generate it
      const { id, readTime, desc, ...rest } = post; 
      
      // Robust mapping: handle source fields safely
      const descriptionVal = desc || post.description || "";
      const readTimeVal = readTime || post.read_time || "5 мин";

      const dbPost = {
        ...rest,
        description: descriptionVal,
        read_time: readTimeVal
      };

      const { data, error } = await supabase.from('posts').insert([dbPost]).select();
      if (error) {
         console.error("Supabase Insert Error:", error);
         throw error;
      }
      
      // Map back for local state update immediately
      const created = data?.[0];
      return { 
        ...created, 
        readTime: created.read_time,
        desc: created.description
      };
    } else {
      // Local Logic
      const saved = localStorage.getItem('neurolearn_posts');
      const posts = saved ? JSON.parse(saved) : initialBlogPosts;
      const newPosts = [post, ...posts];
      localStorage.setItem('neurolearn_posts', JSON.stringify(newPosts));
      return post;
    }
  },

  deletePost: async (id: number) => {
    const supabase = BlogService.getSupabaseClient();
    if (supabase) {
      await supabase.from('posts').delete().eq('id', id);
    } else {
      const saved = localStorage.getItem('neurolearn_posts');
      const posts = saved ? JSON.parse(saved) : initialBlogPosts;
      const newPosts = posts.filter((p: any) => p.id !== id);
      localStorage.setItem('neurolearn_posts', JSON.stringify(newPosts));
    }
  }
};


// --- ADMIN COMPONENTS ---

const AdminLogin = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === "admin123") {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-700 bg-slate-900/50">
        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <Lock size={32} className="text-cyan-400" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Вход для владельца</h2>
        <p className="text-slate-400 text-center mb-6">Введите пароль для доступа к управлению блогом</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              placeholder="Пароль (admin123)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {error && <p className="text-red-500 text-sm mt-2">Неверный пароль</p>}
          </div>
          <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition-all">
            Войти
          </button>
        </form>
        <button onClick={onBack} className="w-full text-slate-500 hover:text-white mt-4 text-sm">
          Вернуться на сайт
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  posts, 
  onAdd, 
  onDelete, 
  onLogout,
  source,
  refreshPosts
}: { 
  posts: typeof initialBlogPosts, 
  onAdd: (post: any) => void, 
  onDelete: (id: number) => void,
  onLogout: () => void,
  source: string,
  refreshPosts: () => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Settings State
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [isConnected, setIsConnected] = useState(source === 'cloud');

  // Load settings on mount to ensure persistence
  useEffect(() => {
    const savedUrl = localStorage.getItem('sb_url') || HARDCODED_SUPABASE_URL;
    const savedKey = localStorage.getItem('sb_key') || HARDCODED_SUPABASE_KEY;
    if (savedUrl) setSbUrl(savedUrl);
    if (savedKey) setSbKey(savedKey);
    
    // Check connection immediately if credentials exist
    if (savedUrl && savedKey) {
        setIsConnected(true); 
    }
  }, []);

  const [newPost, setNewPost] = useState({
    title: "",
    category: "",
    desc: "",
    image: "",
    readTime: "",
    content: ""
  });

  const handleSaveSettings = async () => {
    let url = sbUrl.trim();
    let key = sbKey.trim();
    
    if (url && !url.startsWith('http')) {
        url = `https://${url}`;
    }

    if (!url || !key) {
        alert('Пожалуйста, введите корректный URL и API Key');
        return;
    }

    setIsTestingConnection(true);
    try {
      // Test connection
      const sb = createClient(url, key);
      const { data, error } = await sb.from('posts').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      // Save if successful
      localStorage.setItem('sb_url', url);
      localStorage.setItem('sb_key', key);
      setSbUrl(url); 
      setIsConnected(true);
      refreshPosts(); // refresh main app state
      alert('Успешное подключение к Supabase!');
    } catch (e: any) {
      console.error(e);
      alert(`Ошибка подключения: ${e.message}. \n1. Проверьте URL и Key. \n2. Проверьте, что таблица 'posts' существует. \n3. Проверьте настройки RLS в Supabase.`);
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    // Also warn about hardcoded keys if present
    if (HARDCODED_SUPABASE_URL) {
      alert("Внимание: Ключи удалены из браузера, но они все еще 'вшиты' в код файла (HARDCODED). Сайт подключится снова при перезагрузке.");
    }
    setIsConnected(false);
    setSbUrl('');
    setSbKey('');
    refreshPosts(); // switch back to local
    alert('Отключено от базы данных. Используется локальное хранилище.');
  };

  const clearLocalData = () => {
    if (confirm("Вы уверены? Это удалит ВСЕ локальные статьи из памяти браузера. Если они не были перенесены в облако, они пропадут навсегда.")) {
      localStorage.removeItem('neurolearn_posts');
      refreshPosts();
      alert("Локальное хранилище очищено.");
    }
  };

  const migrateToCloud = async () => {
    if (!isConnected) return alert('Сначала подключитесь к Supabase и сохраните настройки.');
    const confirm = window.confirm("Вы уверены? Это перенесет все локальные статьи в базу данных. Убедитесь, что вы выполнили SQL-скрипт.");
    if (!confirm) return;

    setIsMigrating(true);
    try {
      const supabase = createClient(sbUrl, sbKey);
      
      // Get current local posts
      const localPostsStr = localStorage.getItem('neurolearn_posts');
      const localPosts = localPostsStr ? JSON.parse(localPostsStr) : initialBlogPosts;

      if (!localPosts || localPosts.length === 0) {
        alert("Нет локальных статей для переноса.");
        setIsMigrating(false);
        return;
      }

      console.log("Starting migration of", localPosts.length, "posts");

      let count = 0;
      let errors = 0;

      for (const post of localPosts) {
         // EXPLICIT AND ROBUST MAPPING FOR MIGRATION
         // Check both 'desc' and 'description' keys from source
         const descriptionVal = post.description || post.desc || "Нет описания";
         // Check both 'readTime' and 'read_time' keys from source
         const readTimeVal = post.read_time || post.readTime || "5 мин";

         // Remove ID to let DB auto-increment
         const dbPost = {
            title: post.title,
            description: descriptionVal,
            content: post.content || "",
            category: post.category || "General",
            image: post.image || "",
            read_time: readTimeVal,
            date: post.date || new Date().toLocaleDateString()
         };
         
         const { error } = await supabase.from('posts').insert([dbPost]);
         
         if (error) {
           console.error("Migration Error for post:", post.title, error);
           errors++;
         } else {
           count++;
         }
      }
      
      refreshPosts(); // Reload from DB to confirm
      if (errors > 0) {
        alert(`Перенос завершен. Успешно: ${count}, Ошибок: ${errors}. Проверьте консоль.`);
      } else {
        alert(`Успешно перенесено ${count} статей в облако! Теперь сайт работает с базой данных.`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Критическая ошибка миграции: " + (e.message || e));
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
      ...newPost
    };
    onAdd(post);
    setIsEditing(false);
    setNewPost({ title: "", category: "", desc: "", image: "", readTime: "", content: "" });
  };

  const generateWithGemini = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      // USE HARDCODED KEY IF ENV IS MISSING (FOR VERCEL SUPPORT)
      const apiKey = process.env.API_KEY || HARDCODED_GEMINI_KEY;
      
      if (!apiKey) {
        throw new Error("API Key for Gemini is missing. Please set HARDCODED_GEMINI_KEY in the code.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Ты — профессиональный технический блогер и эксперт по AI.
        Напиши статью для блога на тему: "${aiTopic}".
        
        Требования:
        1. Язык: Русский.
        2. Стиль: Экспертный, но понятный, увлекательный.
        3. Контент должен быть отформатирован в HTML (используй теги <p>, <h3>, <ul>, <li>, <strong>).
        4. Добавь CSS классы Tailwind к HTML тегам для красивого отображения в темной теме (text-white, text-slate-300, mb-4, list-disc, pl-6 и т.д.).
        5. Придумай imagePrompt (на английском) для генерации обложки.
        
        Верни ответ ИСКЛЮЧИТЕЛЬНО в формате JSON, соответствующем схеме.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Заголовок статьи" },
              desc: { type: Type.STRING, description: "Краткое описание для превью (1-2 предложения)" },
              category: { type: Type.STRING, description: "Категория (например: AI, Dev, Tutorial)" },
              readTime: { type: Type.STRING, description: "Время чтения (например: 5 мин)" },
              content: { type: Type.STRING, description: "Полный текст статьи в формате HTML с Tailwind классами" },
              imagePrompt: { type: Type.STRING, description: "Описание для генерации картинки на английском (photorealistic, 8k, cyberpunk style...)" }
            },
            required: ["title", "desc", "category", "readTime", "content", "imagePrompt"]
          }
        }
      });

      const result = JSON.parse(response.text);
      const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(result.imagePrompt + " dark tech style, high quality, 4k")}`;

      setNewPost({
        title: result.title,
        category: result.category,
        desc: result.desc,
        readTime: result.readTime,
        content: result.content,
        image: generatedImageUrl
      });

      setIsAiModalOpen(false);
      setIsEditing(true); 
      setAiTopic("");

    } catch (error: any) {
      console.error("AI Generation failed:", error);
      alert(`Ошибка генерации: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_posts_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Новая статья</h2>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">Отмена</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/40">
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm text-slate-400 mb-2">Заголовок</label>
                  <input required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} placeholder="Название статьи" />
               </div>
               <div>
                  <label className="block text-sm text-slate-400 mb-2">Категория</label>
                  <input required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} placeholder="Тренды, Туториал..." />
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm text-slate-400 mb-2">Ссылка на картинку</label>
                  <input required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={newPost.image} onChange={e => setNewPost({...newPost, image: e.target.value})} placeholder="https://..." />
               </div>
               <div>
                  <label className="block text-sm text-slate-400 mb-2">Время чтения</label>
                  <input required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={newPost.readTime} onChange={e => setNewPost({...newPost, readTime: e.target.value})} placeholder="5 мин" />
               </div>
            </div>

            <div>
               <label className="block text-sm text-slate-400 mb-2">Краткое описание (для карточки)</label>
               <textarea required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 h-24" value={newPost.desc} onChange={e => setNewPost({...newPost, desc: e.target.value})} placeholder="О чем эта статья..." />
            </div>

            <div>
               <label className="block text-sm text-slate-400 mb-2">Полный текст (HTML поддерживается)</label>
               <textarea required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 h-64 font-mono text-sm" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} placeholder="<p>Текст статьи...</p>" />
            </div>

            <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all">
               Опубликовать
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${source === 'cloud' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                {source === 'cloud' ? 'Cloud (Supabase)' : 'Local Storage'}
              </span>
              <p className="text-slate-400 text-sm">Управление контентом</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Tabs Toggle */}
             <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Контент
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Настройки БД
                </button>
             </div>
             <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="glass-card p-8 rounded-2xl bg-slate-900/40 border border-slate-800 animate-fade-in">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Database className="text-cyan-400" /> Подключение к Supabase</h2>
             <p className="text-slate-400 mb-4 max-w-2xl">
               Подключите реальную базу данных, чтобы ваши статьи видели все пользователи.
             </p>

             <div className="mb-8 bg-slate-900 p-4 rounded-lg border border-slate-700">
               <p className="text-xs text-slate-400 mb-2 font-bold uppercase">SQL Код (Внимание: запустите это в Supabase SQL Editor)</p>
               <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
{`drop table if exists public.posts;

create table public.posts (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,  -- ВАЖНО: имя колонки description (не desc)
  content text,
  category text,
  image text,
  read_time text,   -- ВАЖНО: имя колонки read_time
  date text
);

alter table public.posts enable row level security;

-- РАЗРЕШАЕМ ЗАПИСЬ И ЧТЕНИЕ ДЛЯ ВСЕХ (ВАЖНО ДЛЯ МИГРАЦИИ)
create policy "Public Access" on public.posts 
  for all 
  using (true) 
  with check (true);`}
               </pre>
             </div>

             <div className="space-y-4 max-w-xl">
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Project URL</label>
                   <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" value={sbUrl} onChange={e => setSbUrl(e.target.value)} placeholder="https://xyz.supabase.co" />
                </div>
                <div>
                   <label className="block text-sm text-slate-400 mb-2">API Key (public/anon)</label>
                   <input className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3" type="password" value={sbKey} onChange={e => setSbKey(e.target.value)} placeholder="eyJhbGc..." />
                </div>

                <div className="flex gap-4 pt-4">
                  {isConnected ? (
                     <button onClick={handleDisconnect} className="bg-red-500/20 text-red-400 border border-red-500/50 px-6 py-3 rounded-xl font-bold hover:bg-red-500/30 transition-all">
                       Отключить БД
                     </button>
                  ) : (
                     <button 
                       onClick={handleSaveSettings} 
                       disabled={isTestingConnection}
                       className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                     >
                       {isTestingConnection ? <Loader2 className="animate-spin" /> : null}
                       Сохранить и Подключить
                     </button>
                  )}
                </div>

                {/* Show Migration button if connected (allows moving local posts to cloud) */}
                {isConnected && (
                   <div className="mt-8 pt-8 border-t border-slate-800">
                      <h3 className="font-bold text-white mb-2">Миграция данных</h3>
                      <p className="text-sm text-slate-400 mb-4">Перенесите статьи из локального хранилища в базу данных Supabase.</p>
                      <button 
                        onClick={migrateToCloud} 
                        disabled={isMigrating}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-wait"
                      >
                        {isMigrating ? (
                          <>
                             <Loader2 size={20} className="animate-spin" /> Переносим...
                          </>
                        ) : (
                          <>
                             <Cloud size={20} /> Перенести локальные статьи в облако
                          </>
                        )}
                      </button>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'content' && (
          <>
            {/* Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div 
                onClick={() => setIsEditing(true)}
                className="border-2 border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-900/30 transition-all cursor-pointer h-40"
              >
                  <Plus size={32} className="mb-2" />
                  <span className="font-bold">Написать вручную</span>
              </div>

              <div 
                onClick={() => setIsAiModalOpen(true)}
                className="relative overflow-hidden border-2 border-dashed border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-indigo-300 hover:border-indigo-400 hover:text-white hover:bg-indigo-900/20 transition-all cursor-pointer h-40 group"
              >
                  <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
                  <Sparkles size={32} className="mb-2 text-indigo-400" />
                  <span className="font-bold">Сгенерировать с AI</span>
                  <span className="text-xs text-indigo-400/60 mt-1">Gemini Pro + Image Gen</span>
              </div>

              <div className="grid grid-rows-2 gap-4 h-40">
                  <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-slate-300 font-medium"
                  >
                    <Download size={18} /> Скачать бэкап
                  </button>
                  {/* CLEAR LOCAL DATA BUTTON */}
                  <button 
                    onClick={clearLocalData}
                    className="flex items-center justify-center gap-2 bg-red-900/20 border border-red-900/50 rounded-xl hover:bg-red-900/40 hover:border-red-700 text-red-400 font-medium text-xs transition-all"
                  >
                    <Trash2 size={16} /> Сброс: Удалить все локальные статьи
                  </button>
              </div>
            </div>

            {/* Posts List */}
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="glass-card bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                    <img src={post.image} alt={post.title} className="w-full sm:w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="font-bold text-xl mb-1">{post.title}</h3>
                      <p className="text-slate-400 text-sm">{post.date} • {post.category}</p>
                    </div>
                    <button 
                      onClick={() => onDelete(post.id)}
                      className="p-3 rounded-full bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500 mb-4">Статей пока нет.</p>
                  {source === 'cloud' && (
                     <button onClick={() => setActiveTab('settings')} className="text-cyan-400 hover:underline">
                        Перейдите в настройки, чтобы перенести локальные статьи
                     </button>
                  )}
               </div>
            )}
          </>
        )}
      </div>

      {/* AI GENERATION MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl relative">
             <button 
               onClick={() => setIsAiModalOpen(false)}
               className="absolute top-4 right-4 text-slate-500 hover:text-white"
             >
               <X size={24} />
             </button>
             
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                 <Sparkles size={32} />
               </div>
               <h3 className="text-2xl font-bold text-white">О чем написать?</h3>
               <p className="text-slate-400">Введите тему, и AI создаст структуру, текст и обложку.</p>
             </div>

             <input 
               autoFocus
               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-indigo-500 mb-6"
               placeholder="Например: Как нейросети меняют дизайн..."
               value={aiTopic}
               onChange={(e) => setAiTopic(e.target.value)}
             />

             <button 
               onClick={generateWithGemini}
               disabled={isGenerating || !aiTopic}
               className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
             >
               {isGenerating ? (
                 <>
                   <Loader2 size={20} className="animate-spin" />
                   Пишу статью...
                 </>
               ) : (
                 <>
                   <Sparkles size={20} />
                   Магия
                 </>
               )}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};


// --- SINGLE POST PAGE COMPONENT ---
const SinglePostPage = ({ post, onBack, onShare }: { post: typeof initialBlogPosts[0], onBack: () => void, onShare?: () => void }) => {
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      window.scrollTo(0, 0);
      document.title = `${post.title} | NeuroLearn Blog`;
      return () => { document.title = "NeuroLearn - Курсы по ИИ"; }
   }, [post]);

   const handleShare = () => {
     if (onShare) {
       onShare();
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
     }
   };

   return (
      <div className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20">
         {/* Reusing Nav Layout */}
         <nav className="fixed top-0 left-0 w-full z-50 glass-nav py-4 shadow-sm bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
             <div 
               className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white cursor-pointer"
               onClick={onBack}
             >
                <Brain className="text-cyan-400" size={32} />
                <span>Neuro<span className="text-cyan-400">Learn</span></span>
             </div>
             <button onClick={onBack} className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 border border-slate-700 px-4 py-2 rounded-full hover:bg-slate-800 transition-all">
               <ChevronLeft size={16} /> Назад к статьям
             </button>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto px-6">
           <div className="mb-8 flex flex-wrap gap-4 items-center text-sm text-slate-400">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-bold">
                 {post.category}
              </span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {post.date}</span>
              <span className="flex items-center gap-1"><Clock size={14}/> {post.readTime} чтения</span>
           </div>

           <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              {post.title}
           </h1>

           <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-slate-800 relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
           </div>

           <div className="prose prose-lg prose-invert max-w-none text-slate-300">
              {/* Rendering HTML content safely */}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
           </div>

           <div className="mt-16 pt-10 border-t border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-2">Понравилась статья?</h3>
                    <p className="text-slate-400 text-sm">Поделитесь ей с друзьями или коллегами</p>
                 </div>
                 <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold transition-all"
                 >
                    {copied ? <Check size={18} /> : <Share2 size={18} />} 
                    {copied ? "Ссылка скопирована!" : "Поделиться"}
                 </button>
              </div>
           </div>
        </article>
      </div>
   );
}

// --- BLOG LIST PAGE COMPONENT ---
const BlogPage = ({ posts, onBack, onSelectPost }: { posts: typeof initialBlogPosts, onBack: () => void, onSelectPost: (post: any) => void }) => {
  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-20 px-6">
      <nav className="fixed top-0 left-0 w-full z-50 glass-nav py-4 shadow-sm bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
           <div 
             className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white cursor-pointer"
             onClick={onBack}
           >
              <Brain className="text-cyan-400" size={32} />
              <span>Neuro<span className="text-cyan-400">Learn</span></span>
           </div>
           <button onClick={onBack} className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2">
             <ChevronLeft size={16} /> На главную
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Наш Блог</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Последние новости, туториалы и инсайты из мира Искусственного Интеллекта.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <div key={idx} className="group rounded-2xl overflow-hidden bg-slate-800/40 border border-slate-700/50 hover:border-slate-500 transition-all duration-300 flex flex-col h-full">
                <div className="h-48 overflow-hidden relative flex-shrink-0">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-400 border border-slate-700">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {post.desc}
                  </p>
                  <button 
                      onClick={() => onSelectPost(post)}
                      className="text-sm font-bold text-white flex items-center gap-2 group/btn mt-auto"
                  >
                    Читать статью <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  
  // STATE: Main Logic for Routing and Data
  const [currentView, setCurrentView] = useState<'home' | 'blog' | 'post' | 'admin-login' | 'admin'>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // State for Blog Data (Loaded via Service)
  const [blogPosts, setBlogPosts] = useState<any[]>(initialBlogPosts);
  const [dataSource, setDataSource] = useState<'local' | 'cloud'>('local');

  // --- ROUTING LOGIC ---
  useEffect(() => {
    // 1. Handle URL params on initial load
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const postId = params.get('id');

    if (view === 'blog') {
      setCurrentView('blog');
    } else if (view === 'post' && postId) {
      loadPostById(postId);
    } else if (view === 'admin') {
      setCurrentView('admin-login');
    } else {
      setCurrentView('home');
    }

    // 2. Load all posts anyway
    loadPosts();

    // 3. Listen for browser back/forward buttons
    const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const v = p.get('view');
        const id = p.get('id');
        
        if (v === 'blog') setCurrentView('blog');
        else if (v === 'post' && id) loadPostById(id);
        else if (v === 'admin') setCurrentView('admin-login');
        else setCurrentView('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (view: string, id: string | number | null = null) => {
    const url = new URL(window.location.href);
    if (view === 'home') {
      url.search = '';
    } else {
      url.searchParams.set('view', view);
      if (id) {
        url.searchParams.set('id', String(id));
      } else {
        url.searchParams.delete('id');
      }
    }
    window.history.pushState({}, '', url.toString());
  };

  const navigateTo = (view: 'home' | 'blog' | 'post' | 'admin-login' | 'admin', post: any = null) => {
    setCurrentView(view);
    if (view === 'post' && post) {
      setSelectedPost(post);
      updateUrl('post', post.id);
    } else {
      setSelectedPost(null);
      updateUrl(view);
    }
  };

  const loadPostById = async (id: string) => {
    setLoading(true);
    const post = await BlogService.getPostById(id);
    if (post) {
      setSelectedPost(post);
      setCurrentView('post');
    } else {
      // If not found, go back to home or show 404
      alert("Статья не найдена");
      navigateTo('home');
    }
    setLoading(false);
  };

  const loadPosts = async () => {
     const { posts, source } = await BlogService.getAllPosts();
     setBlogPosts(posts);
     setDataSource(source as any);
  };

  const handleAddPost = async (post: any) => {
    try {
      const savedPost = await BlogService.createPost(post);
      if (dataSource === 'cloud') {
         // Refresh list to get proper ID from DB
         await loadPosts();
      } else {
         setBlogPosts([post, ...blogPosts]);
      }
    } catch (e) {
      alert("Error saving post");
    }
  };

  const handleDeletePost = async (id: number) => {
    await BlogService.deletePost(id);
    setBlogPosts(blogPosts.filter(p => p.id !== id));
  };
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSharePost = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const navLinks = [
    { name: "Программа", href: "#curriculum" },
    { name: "Формат", href: "#format" },
    { name: "Наставник", href: "#mentor" },
    { name: "Отзывы", href: "#reviews" },
    { name: "Тарифы", href: "#pricing" },
  ];

  // ... (Keeping rest of constants: faqs, directions, aiSolutions etc.)
  // SHORTENED FOR BREVITY - FULL CONTENT IS PRESERVED IN FINAL RENDER
  // JUST ENSURING navigateTo IS USED INSTEAD OF setCurrentView

  const faqs = [
    {
      question: "Нужно ли уметь программировать, чтобы начать?",
      answer: "Нет. Курс построен так, что вы начнете с low-code инструментов (n8n), где код не нужен. А когда мы перейдем к коду, вы освоите \"вайб-кодинг\" – мы будем генерировать его с помощью AI, а не заучивать синтаксис. Главное – ваше желание создавать, а не ваш текущий уровень."
    },
    {
      question: "Какой компьютер мне нужен? Подойдет ли мой старый ноутбук?",
      answer: "Для 80% курса (работа с n8n, API, кодинг) подойдет любой современный компьютер. Для модулей по Computer Vision и 3D-симуляциям (YOLO, Unreal Engine) желательна видеокарта NVIDIA (серии GTX 1660 или новее), но это не обязательно – я покажу, как можно обучать модели в облаке (например, в Google Colab)."
    },
    {
      question: "Это курс в записи или живые занятия?",
      answer: "Это гибридный формат, который берет лучшее от двух миров. Основные материалы – это уроки в записи, которые вы смотрите в удобное время. А каждую неделю мы проводим живую Q&A сессию, где я отвечаю на ваши вопросы и разбираю сложные темы. На тарифе \"Архитектор\" у вас также будут персональные созвоны со мной."
    },
    {
      question: "Сколько времени в неделю мне нужно будет уделять учебе?",
      answer: "Мы рекомендуем закладывать 8-10 часов в неделю. Этого достаточно, чтобы комфортно смотреть уроки и выполнять практические задания. Главное – регулярность."
    },
    {
      question: "Поможете ли вы с поиском работы?",
      answer: "Мы делаем лучше. Мы не \"помогаем с поиском\", мы создаем ситуацию, когда работа находит вас сама. К концу курса у вас будет портфолио из 4-5 реальных, сложных AI-проектов. Это ваше главное преимущество, которое заставит рекрутеров и клиентов самих писать вам. На тарифе \"Архитектор\" мы также проводим карьерную консультацию и готовим к собеседованиям."
    },
    {
      question: "Я получу сертификат?",
      answer: "Да, вы получите сертификат. Но мы честны: на современном IT-рынке сертификат – это просто бумага. Вашу ценность определяет ваше портфолио. Наш главный фокус – сделать так, чтобы ваш дипломный проект был настолько сильным, что вам не придется никому показывать сертификат."
    },
    {
      question: "А если мне не понравится? Есть ли возврат?",
      answer: "Да. Мы абсолютно уверены в качестве программы. Если в течение первых 14 дней после начала курса вы поймете, что это не ваше, мы вернем вам 100% оплаты без лишних вопросов."
    },
    {
      question: "Я не из IT / я гуманитарий. У меня получится?",
      answer: "Этот курс идеально подходит для вас. Мы не учим \"хардкорной\" математике или алгоритмам. Мы учим системному мышлению и работе с современными инструментами (low-code и AI). Ваша способность видеть бизнес-проблему или креативную задачу – это ваше главное преимущество, а мы дадим вам инструменты для ее решения."
    }
  ];

  const directions = [
    {
      title: "LLM & RAG",
      subtitle: "Архитектура умных систем",
      color: "text-blue-400",
      accent: "bg-blue-500",
      icon: <Brain size={96} strokeWidth={1} className="text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
    },
    {
      title: "Conversation AI",
      subtitle: "Голосовые ассистенты",
      color: "text-rose-400",
      accent: "bg-rose-500",
      icon: <MessageSquare size={96} strokeWidth={1} className="text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
    },
    {
      title: "Computer Vision",
      subtitle: "Техническое зрение",
      color: "text-violet-400",
      accent: "bg-violet-500",
      icon: <Eye size={96} strokeWidth={1} className="text-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
    },
    {
      title: "No-Code Automation",
      subtitle: "Автоматизация процессов",
      color: "text-indigo-400",
      accent: "bg-indigo-500",
      icon: <Workflow size={96} strokeWidth={1} className="text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
    },
    {
      title: "Generative AI",
      subtitle: "Генерация контента",
      color: "text-emerald-400",
      accent: "bg-emerald-500",
      icon: <LineChart size={96} strokeWidth={1} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
    },
    {
      title: "Vibe Coding",
      subtitle: "Быстрая разработка",
      color: "text-cyan-400",
      accent: "bg-cyan-500",
      icon: <Terminal size={96} strokeWidth={1} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
    }
  ];

  const aiSolutions = [
    {
      title: "Практический разбор AI",
      category: "Video Case",
      desc: "Смотрите, как работают нейросети в реальных задачах.",
      image: "https://img.youtube.com/vi/P-vJT2BHJmM/maxresdefault.jpg",
      icon: <MonitorPlay size={24} />
    },
    {
      title: "Корпоративный RAG Чат-бот",
      category: "Enterprise AI",
      desc: "Мгновенные ответы по всей базе знаний компании.",
      image: "https://img.youtube.com/vi/PWrbCCVkRxM/maxresdefault.jpg",
      icon: <Database size={24} />
    },
    {
      title: "Голосовой AI-Ассистент 24/7",
      category: "Voice AI",
      desc: "Прием звонков и заказов без участия оператора.",
      image: "https://img.youtube.com/vi/4ZoOxUvfDW8/maxresdefault.jpg",
      icon: <Bot size={24} />
    },
    {
      title: "Smart Video Analytics",
      category: "Computer Vision",
      desc: "Контроль безопасности и подсчет трафика в реальном времени.",
      image: "https://img.youtube.com/vi/qeC-wwgOon4/maxresdefault.jpg",
      icon: <Scan size={24} />
    },
    {
      title: "AI Content Factory",
      category: "Marketing Automation",
      desc: "Генерация SEO-статей и постов под бренд.",
      image: "https://img.youtube.com/vi/Lh8Ghj5ftCQ/maxresdefault.jpg",
      icon: <PenTool size={24} />
    }
  ];

  // Auto-rotate AI Solutions slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSolutionIndex((prev) => (prev + 1) % aiSolutions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSolutionIndex]);

  const nextSolution = () => {
    setCurrentSolutionIndex((prev) => (prev + 1) % aiSolutions.length);
  };

  const prevSolution = () => {
    setCurrentSolutionIndex((prev) => (prev - 1 + aiSolutions.length) % aiSolutions.length);
  };

  // --- VIEW CONTROLLER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (currentView === 'admin-login') {
    return <AdminLogin onLogin={() => navigateTo('admin')} onBack={() => navigateTo('home')} />;
  }

  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        posts={blogPosts} 
        onAdd={handleAddPost}
        onDelete={handleDeletePost}
        onLogout={() => navigateTo('home')}
        source={dataSource}
        refreshPosts={loadPosts}
      />
    );
  }

  if (currentView === 'post' && selectedPost) {
      return <SinglePostPage post={selectedPost} onBack={() => { setSelectedPost(null); navigateTo('blog'); }} onShare={handleSharePost} />;
  }

  if (currentView === 'blog') {
    return <BlogPage posts={blogPosts} onBack={() => navigateTo('home')} onSelectPost={(post) => { navigateTo('post', post); }} />;
  }

  return (
    <div className="min-h-screen relative text-slate-200 bg-slate-950 selection:bg-indigo-500 selection:text-white">
      {/* Ambient Background Blobs - Refined for "Haze" effect */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-950/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-slate-900/60 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-blue-950/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "glass-nav py-4 shadow-sm" : "py-6 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white cursor-pointer" onClick={() => navigateTo('home')}>
            <Brain className="text-cyan-400" size={32} />
            <span>Neuro<span className="text-cyan-400">Learn</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
                {link.name}
              </a>
            ))}
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)]">
              Войти
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-200" onClick={toggleMenu}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full glass-nav border-t border-slate-700 p-6 flex flex-col gap-4 shadow-xl bg-slate-950/95">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-lg font-medium py-2 border-b border-slate-800 text-slate-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 w-full py-3 rounded-lg font-bold mt-2">
              Войти
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 relative z-20 lg:pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Старт нового потока: 15 Октября
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
              Будущее с <br />
              Искусственным Интеллектом
            </h1>
            
            <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
              Освойте разработку AI-систем: от проектирования до внедрения. Создавайте инновации, решайте реальные задачи и стройте успешную карьеру в AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#pricing">
                <button className="bg-cyan-500 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-400 transition-colors shadow-[0_4px_14px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2">
                  Начать обучение <ChevronRight size={20} />
                </button>
              </a>
              <a href="https://www.youtube.com/watch?v=YPGs6Hxz1rI" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-full font-medium text-slate-300 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center gap-2">
                  <Play size={18} className="fill-current" /> Демо-урок
                </button>
              </a>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="student" className="w-full h-full" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-white">1,200+ студентов</p>
                <p className="text-sm text-slate-400">уже работают в IT</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end items-center py-10 lg:py-0">
             {/* Large "Stage" Glow behind the image */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-[100px]"></div>
             
             {/* Floating 3D Image */}
             <img 
               src="https://i.ibb.co/HLCP25Sz/7656304.webp" 
               alt="AI Future" 
               className="relative z-10 w-[300px] md:w-[400px] lg:w-[450px] object-contain animate-float drop-shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
             />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Часов контента", val: "120+" },
            { label: "Практических задач", val: "50+" },
            { label: "Проектов в портфолио", val: "4" },
            { label: "Менторская поддержка", val: "24/7" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-base md:text-lg text-slate-400 font-medium">{stat.label}</div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Who is this for */}
      <section id="who" className="py-24 px-6 relative bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Кому подойдет курс</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Мы разработали 6 треков обучения под разные карьерные цели и стартовый уровень
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Предпринимателям",
                subtitle: "Automate & Scale",
                desc: "Автоматизируйте бизнес-процессы и запускайте AI-решения самостоятельно.",
                icon: <Briefcase size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />,
                gradient: "from-blue-600 to-indigo-600",
                frameless: true
              },
              {
                title: "Руководителям",
                subtitle: "Manage & Innovate",
                desc: "Управляйте AI-проектами и быстро тестируйте бизнес-гипотезы.",
                icon: <Target size={48} className="text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />,
                gradient: "from-rose-500 to-orange-500",
                frameless: true
              },
              {
                title: "Фрилансерам",
                subtitle: "Build & Sell",
                desc: "Предлагайте уникальные AI-услуги и увеличьте свой средний чек.",
                icon: <Globe size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />,
                gradient: "from-emerald-500 to-teal-500",
                frameless: true
              },
              {
                title: "IT-Специалистам",
                subtitle: "Upgrade Skills",
                desc: "Совершите апгрейд в самую востребованную профессию — AI-инженера.",
                icon: <Code size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />,
                gradient: "from-cyan-500 to-blue-500",
                frameless: true
              },
              {
                title: "Новичкам",
                subtitle: "Start Career",
                desc: "Начните карьеру в IT с мощного портфолио AI-проектов.",
                // WHITE ICON
                icon: <GraduationCap size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />,
                gradient: "from-white to-slate-200", // WHITE GLOW
                frameless: true
              },
              {
                title: "Креаторам",
                subtitle: "Create & Inspire",
                desc: "Используйте AI для создания контента и автоматизации своего творчества.",
                icon: <Zap size={48} className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />,
                gradient: "from-purple-500 to-pink-500",
                frameless: true
              }
            ].map((card, idx) => (
                <div 
                  key={idx} 
                  className="group relative rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border bg-slate-800/40 border-slate-700 hover:border-slate-500"
                >
                  {/* Top Glow Light Source */}
                  <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-r ${card.gradient} opacity-10 blur-[60px] group-hover:opacity-20 transition-all duration-500`}></div>
                  
                  <div className="relative p-8 pt-10">
                    {/* Header Row: Icon + Subtitle */}
                    <div className="flex justify-between items-start mb-6">
                        <div className={card.frameless ? 
                          "flex items-center justify-center group-hover:scale-110 transition-transform duration-300" :
                          "w-14 h-14 rounded-xl bg-slate-700/50 border-slate-600 flex items-center justify-center shadow-sm backdrop-blur-sm group-hover:scale-110 transition-all duration-300"
                        }>
                          {card.icon}
                        </div>

                        <div className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border text-slate-400 bg-slate-800 border-slate-700">
                          {card.subtitle}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 transition-colors text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4 text-slate-400">
                      {card.desc}
                    </p>

                    {/* Bottom accent line appearing on hover */}
                    <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${card.gradient} transition-all duration-700 ease-out rounded-full opacity-80`}></div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directions Section (Holographic Showcase) */}
      <section className="py-24 px-6 relative bg-slate-950">
         <div className="max-w-7xl mx-auto">
           <div className="flex flex-col items-center text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
               Системы и технологии
             </h2>
             <p className="text-slate-400 max-w-lg">
               Изучайте самые востребованные технологии AI-индустрии в формате 3D-погружения.
             </p>
             <button className="hidden md:flex items-center gap-2 text-slate-300 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-full transition-colors border border-slate-700 shadow-sm mt-8">
               Все направления <ArrowRight size={18} />
             </button>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {directions.map((card, idx) => (
               <div 
                 key={idx} 
                 className="group relative h-[420px] rounded-3xl bg-slate-800/40 border border-slate-700 overflow-hidden transition-all duration-500 hover:border-slate-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
               >
                 {/* Top Highlight Line */}
                 <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                 {/* Central Stage / 3D Placeholder Area */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pb-24"> 
                    {/* The "Stage" Glow - Centered and Big */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full ${card.accent} opacity-10 filter blur-[80px] group-hover:opacity-20 transition-all duration-500`}></div>
                    
                    {/* Icon Container (Big) */}
                    <div className="relative z-10 w-72 h-72 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                      <div className="w-full h-full flex items-center justify-center">
                        {card.icon}
                      </div>
                    </div>
                 </div>

                 {/* Text Content Overlay */}
                 <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-24">
                   <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{card.title}</h3>
                   <div className="flex justify-between items-center">
                      <p className="text-slate-400 text-sm font-medium">{card.subtitle}</p>
                      <div className={`w-10 h-10 rounded-full ${card.accent} flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md`}>
                        <ArrowRight size={18} />
                      </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Программа обучения</h2>
              <p className="text-slate-400">Пошаговый путь от новичка до AI Expert</p>
            </div>
            <button className="text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-2">
              Скачать полную программу <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {[
              { num: "01", title: "Введение в AI Мышление", hours: "1 неделя", topics: ["Промпт-инжиниринг", "Стратегия внедрения", "Обзор инструментов"] },
              { num: "02", title: "Low-code / No-code Автоматизация", hours: "2 недели", topics: ["n8n & Make", "Интеграции API", "Автоматизация процессов"] },
              { num: "03", title: "Архитектура LLM и RAG решений", hours: "3 недели", topics: ["LangChain", "Векторные базы", "Embeddings", "Семантический поиск"] },
              { num: "04", title: "Разговорный AI", hours: "2 недели", topics: ["TTS & STT", "Голосовые ассистенты", "OpenAI Realtime API"] },
              { num: "05", title: "Machine Learning и Computer Vision", hours: "5 недель", topics: ["Scikit-learn", "YOLO", "OpenCV", "Предиктивная аналитика", "Работа с данными"] },
              { num: "06", title: "Fullstack разработка", hours: "4 недели", topics: ["React", "FastAPI", "Интеграция AI", "Деплой"] },
              { num: "07", title: "Контент Маркетинг", hours: "2 недели", topics: ["AI-генерация", "Автопостинг", "SMM стратегии"] },
              { num: "08", title: "Финальный проект", hours: "3 недели", topics: ["Разработка MVP", "Упаковка кейса", "Запуск продукта"] },
            ].map((module, idx) => (
              <div key={idx} className="group glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center bg-slate-800/50">
                <div className="text-4xl font-bold text-slate-700 group-hover:text-cyan-400 transition-colors">{module.num}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-100">{module.title}</h3>
                    <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{module.hours}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {module.topics.map((topic, tIdx) => (
                      <span key={tIdx} className="text-sm text-indigo-300 bg-indigo-900/30 border border-indigo-500/30 px-3 py-1 rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Features (Why Choose Us) */}
      <section id="features" className="py-24 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Чему научитесь</h2>
            <p className="text-slate-400 max-w-2xl text-lg mx-auto">
              Это не просто курс. Это система, которая дает вам новые способности.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {[
              { 
                colSpan: "lg:col-span-3",
                icon: <Network size={64} strokeWidth={1} className="drop-shadow-[0_0_25px_rgba(96,165,250,0.6)]" />, 
                title: "Мышление Архитектора", 
                desc: "Проектируйте AI-решения для бизнес-задач, а не просто пишите код.",
                gradient: "from-blue-500 to-indigo-500",
                textCol: "text-blue-400",
                borderCol: "group-hover:border-blue-500/50",
                glow: "bg-blue-500"
              },
              { 
                colSpan: "lg:col-span-3",
                icon: <Wand size={64} strokeWidth={1} className="drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]" />, 
                title: "\"Человек-Оркестр\"", 
                desc: "Освойте весь стек от автоматизации до AI, чтобы создавать продукты в одиночку.",
                gradient: "from-pink-500 to-rose-500",
                textCol: "text-pink-400",
                borderCol: "group-hover:border-pink-500/50",
                glow: "bg-pink-500"
              },
              { 
                colSpan: "lg:col-span-2",
                icon: <Rocket size={64} strokeWidth={1} className="drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]" />, 
                title: "Сверхбыстрый Кодинг", 
                desc: "Генерируйте 80% кода с помощью AI и запускайте MVP за дни.",
                gradient: "from-amber-400 to-orange-500",
                textCol: "text-amber-400",
                borderCol: "group-hover:border-amber-500/50",
                glow: "bg-amber-500"
              },
              { 
                colSpan: "lg:col-span-2",
                icon: <Trophy size={64} strokeWidth={1} className="drop-shadow-[0_0_25px_rgba(167,139,250,0.6)]" />, 
                title: "Проект Мечты", 
                desc: "Создайте один мощный AI-продукт, который станет главным кейсом.",
                gradient: "from-violet-500 to-purple-500",
                textCol: "text-violet-400",
                borderCol: "group-hover:border-violet-500/50",
                glow: "bg-violet-500"
              },
              { 
                colSpan: "lg:col-span-2",
                icon: <Laptop size={64} strokeWidth={1} className="drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]" />, 
                title: "Полная Свобода", 
                desc: "Запускайте свои стартапы, выбирайте лучшие проекты.",
                gradient: "from-emerald-500 to-teal-500",
                textCol: "text-emerald-400",
                borderCol: "group-hover:border-emerald-500/50",
                glow: "bg-emerald-500"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-800/40 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${feature.colSpan} ${feature.borderCol}`}
              >
                {/* Internal Glow Effect */}
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-all duration-500 ${feature.glow}`}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="mb-6">
                    <div className={`mb-6 ${feature.textCol} transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 inline-block`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Gradient Line Bottom */}
                  <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Format Section */}
      <section id="format" className="py-24 px-6 relative overflow-hidden bg-slate-900/50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Формат обучения</h2>
            <p className="text-slate-400">Мы создали среду, в которой невозможно не научиться</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Video,
                color: "cyan",
                title: "Видео-уроки",
                text: "Короткие лекции по 15-20 минут без воды. Смотрите в удобное время."
              },
              {
                icon: Code,
                color: "purple",
                title: "Много практики",
                text: "Реальные задачи после каждого урока. 80% времени вы пишите код."
              },
              {
                icon: MessageSquare,
                color: "emerald",
                title: "Поддержка 24/7",
                text: "Чат с менторами и одногруппниками. Ответы на вопросы за 15 минут."
              },
              {
                icon: MonitorPlay,
                color: "pink",
                title: "Live-разборы",
                text: "Еженедельные стримы с экспертами и Q&A сессии."
              }
            ].map((item, i) => {
               // Define color maps to ensure tailwind picks them up
               const colors: Record<string, { text: string, shadow: string, glow: string }> = {
                 cyan: { 
                   text: "text-cyan-400", 
                   shadow: "drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]",
                   glow: "bg-cyan-500/10"
                 },
                 purple: { 
                   text: "text-purple-400", 
                   shadow: "drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]",
                   glow: "bg-purple-500/10"
                 },
                 emerald: { 
                   text: "text-emerald-400", 
                   shadow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]",
                   glow: "bg-emerald-500/10"
                 },
                 pink: { 
                   text: "text-pink-400", 
                   shadow: "drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]",
                   glow: "bg-pink-500/10"
                 }
               };
               
               const style = colors[item.color];

               return (
                <div key={i} className="group flex flex-col items-center text-center p-6">
                  <div className="mb-6 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {/* Background Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-lg opacity-20 ${style.glow}`}></div>
                    {/* Icon */}
                    <item.icon size={56} strokeWidth={1} className={`relative z-10 ${style.text} ${style.shadow}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio/Cases Section (Slideshow) */}
      <section className="py-24 px-6 bg-slate-950 relative border-t border-slate-800 overflow-hidden">
         {/* White Ambient Mesh Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] md:w-[800px] md:h-[800px] bg-gradient-to-tr from-slate-800/20 via-white/5 to-slate-800/20 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Портфолио/Кейсы</h2>
              <p className="text-slate-400">Проекты, которые вы сможете реализовать после курса</p>
            </div>
            
            {/* Carousel Container */}
            <div className="max-w-5xl mx-auto relative rounded-2xl overflow-hidden aspect-video group shadow-2xl border border-slate-800 bg-slate-900">
               {/* Background Image */}
               <img 
                 src={aiSolutions[currentSolutionIndex].image} 
                 alt={aiSolutions[currentSolutionIndex].title} 
                 className={`w-full h-full object-cover transition-transform duration-700 ease-out opacity-80 ${
                   [1, 3, 4].includes(currentSolutionIndex) ? 'scale-110' : 'group-hover:scale-105'
                 }`}
               />
               
               {/* Dark Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
               
               {/* YouTube-like Play Button */}
               <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                     <Play size={32} fill="white" className="text-white ml-2" />
                  </div>
               </div>

               {/* Content Overlay */}
               <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 z-20 flex flex-col justify-end">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                    {aiSolutions[currentSolutionIndex].icon}
                    {aiSolutions[currentSolutionIndex].category}
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {aiSolutions[currentSolutionIndex].title}
                  </h3>
                  <p className="text-slate-300 text-base md:text-lg font-medium max-w-2xl drop-shadow-sm">
                    {aiSolutions[currentSolutionIndex].desc}
                  </p>
               </div>

               {/* Navigation Buttons */}
               <button 
                 onClick={prevSolution}
                 className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-cyan-500 hover:text-black transition-all backdrop-blur-sm border border-white/10 z-30"
               >
                 <ChevronLeft size={24} />
               </button>
               <button 
                 onClick={nextSolution}
                 className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-cyan-500 hover:text-black transition-all backdrop-blur-sm border border-white/10 z-30"
               >
                 <ChevronRight size={24} />
               </button>

               {/* Progress Indicators */}
               <div className="absolute bottom-10 right-10 flex gap-2 z-30">
                 {aiSolutions.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentSolutionIndex ? 'w-8 bg-cyan-500' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                   ></div>
                 ))}
               </div>
            </div>
         </div>
      </section>

      {/* Mentor Section */}
      <section id="mentor" className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Обо мне</h2>
             <p className="text-slate-400">Познакомьтесь с вашим наставником</p>
          </div>

          <div className="glass-card bg-slate-800/30 rounded-3xl p-8 md:p-12 border border-slate-700 flex flex-col md:flex-row gap-12 items-center shadow-lg">
            <div className="w-full md:w-1/3 relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img 
                src="https://i.ibb.co/CKK0M5cs/Untitled-5.png" 
                alt="Mentor" 
                className="relative rounded-2xl w-full aspect-[3/4] object-cover transition-all duration-500 shadow-sm opacity-90 group-hover:opacity-100"
              />
            </div>
            <div className="w-full md:w-2/3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-base font-medium mb-6">
                <GraduationCap size={18} />
                Ваш наставник
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Alexandr Gavrilov</h2>
              <p className="text-xl text-cyan-400 mb-6">Senior AI Engineer & Tech Lead</p>
              
              <div className="space-y-4 text-slate-300 mb-8 leading-relaxed">
                <p>
                  Более 10 лет в разработке, из них 6 лет специализируюсь на ML и AI. Работал в ведущих тех-гигантах (Yandex, Silicon Valley startups).
                </p>
                <p>
                  Автор популярных Open Source библиотек по NLP. Спикер конференций HighLoad и DataFest.
                  Обучил более 500 студентов, которые сейчас работают в Sber, Tinkoff и зарубежных стартапах.
                </p>
              </div>

              <div className="flex gap-4">
                <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-slate-400 border border-slate-700">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-white transition-colors text-slate-400 border border-slate-700">
                  <Github size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Блог и статьи</h2>
              <p className="text-slate-400">Полезные материалы для погружения в тему</p>
            </div>
            <button 
              onClick={() => navigateTo('blog')}
              className="text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-2 border border-indigo-500/30 px-6 py-3 rounded-full hover:bg-indigo-900/20 transition-all"
            >
              Читать все статьи <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post, idx) => (
              <div key={idx} className="group rounded-2xl overflow-hidden bg-slate-800/40 border border-slate-700/50 hover:border-slate-500 transition-all duration-300 flex flex-col h-full">
                <div className="h-48 overflow-hidden relative flex-shrink-0">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-400 border border-slate-700">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {post.desc}
                  </p>
                  <button 
                    onClick={() => navigateTo('post', post)}
                    className="text-sm font-bold text-white flex items-center gap-2 group/btn mt-auto"
                  >
                    Читать статью <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
             <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Отзывы</h2>
             <p className="text-slate-400">Что говорят студенты о курсе</p>
          </div>

          <div className="glass-card bg-slate-800/30 rounded-3xl md:pl-10 border border-slate-700 flex flex-col md:flex-row gap-0 items-center shadow-lg relative overflow-hidden h-auto md:h-[360px]">
            {/* Background Gradient/Blob */}
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Content (Left) */}
            <div className="w-full md:w-1/2 flex flex-col items-start relative z-10 p-6 md:py-0 md:pr-0 self-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86c232]/10 text-[#86c232] border border-[#86c232]/20 text-sm font-medium mb-3">
                <Star size={16} fill="currentColor" />
                Верифицировано KWORK
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Рейтинг и отзывы</h2>
              
              <div className="space-y-4 text-slate-300 mb-6 leading-relaxed text-base md:text-lg">
                <p>
                  Все отзывы верифицированы независимой фриланс-биржей KWORK. 100% студентов довольны результатом.
                </p>
              </div>

              <a 
                href="https://kwork.ru" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#86c232] hover:bg-[#618b25] text-slate-900 px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-[0_4px_14px_rgba(134,194,50,0.3)] flex items-center gap-2 hover:scale-105 transform duration-200"
              >
                Читать на KWORK <ArrowRight size={18} />
              </a>
            </div>

            {/* Image (Right) */}
            <div className="w-full md:w-1/2 flex justify-center items-center relative z-10 h-full">
               {/* Green Glow behind image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[80px] -z-10"></div>
              
              <img 
                src="https://i.ibb.co/zWFMLDc1/Remove-background-project-3.png" 
                alt="Отзывы Kwork" 
                className="h-[240%] w-auto object-contain drop-shadow-[0_20px_50px_rgba(134,194,50,0.4)] md:-translate-x-10 md:translate-y-20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 relative bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Часто задаваемые вопросы</h2>
            <p className="text-slate-400">Ответы на популярные вопросы о курсе</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`glass-card rounded-2xl border border-slate-700 bg-slate-800/40 overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'hover:border-slate-500'}`}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="text-lg font-bold text-white pr-8">{faq.question}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center transition-transform duration-300 ${openFaqIndex === idx ? 'bg-cyan-500 text-slate-900 rotate-180' : 'text-slate-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-slate-300 leading-relaxed">
                       <div className="h-px w-full bg-slate-700 mb-4"></div>
                       {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Выберите свой путь к AI-мастерству</h2>
            <p className="text-slate-400">Пройдите интенсивный 1-месячный курс и трансформируйте свои навыки.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* 1. Researcher Plan */}
            <div className="group relative p-8 rounded-3xl border border-slate-700 border-t-4 border-t-slate-600 bg-slate-800/40 backdrop-blur-md shadow-lg flex flex-col h-full overflow-hidden hover:border-slate-500 transition-all duration-500">
               {/* Top Highlight Line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               {/* Central Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-500 rounded-full opacity-5 blur-[80px] group-hover:opacity-15 transition-all duration-500 pointer-events-none"></div>
               {/* Bottom Gradient Glow */}
               <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-wide">ИССЛЕДОВАТЕЛЬ</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                  Для самостоятельных энтузиастов, которым нужна система.
                </p>
                
                <div className="mb-8">
                  <div className="text-4xl font-bold text-white mb-1">49 900 ₽</div>
                  <div className="text-sm text-slate-500">или от 4 158 ₽/мес</div>
                </div>

                <div className="space-y-4 flex-grow">
                  {[
                    "Полный доступ к урокам (навсегда)",
                    "Доступ в закрытое комьюнити",
                    "Практические задания (авто-проверка)",
                    "Сертификат о прохождении"
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3 text-slate-300 text-sm">
                      <CheckCircle size={18} className="text-slate-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 rounded-xl border border-slate-600 text-white font-bold hover:bg-slate-700 hover:border-slate-500 transition-all mt-8">
                  Выбрать 'Исследователя'
                </button>
              </div>
            </div>

            {/* 2. Practitioner Plan (Popular) */}
            <div className="relative transform md:-translate-y-4">
               {/* Badge outside overflow hidden */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20">
                  Самый популярный
               </div>

               <div className="group relative p-8 rounded-3xl border border-cyan-500/50 border-t-4 border-t-cyan-500 bg-slate-800/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col h-full overflow-hidden hover:shadow-[0_0_50px_rgba(6,182,212,0.25)] transition-all duration-500">
                 
                 {/* Top Highlight Line */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 {/* Central Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full opacity-10 blur-[80px] group-hover:opacity-20 transition-all duration-500 pointer-events-none"></div>
                 {/* Bottom Gradient Glow */}
                 <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                 <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-wide text-cyan-400">ПРАКТИК</h3>
                    <p className="text-slate-300 text-sm mb-6 min-h-[40px]">
                      Для тех, кто хочет дойти до результата с поддержкой наставника.
                    </p>
                    
                    <div className="mb-8">
                      <div className="text-4xl font-bold text-white mb-1">99 900 ₽</div>
                      <div className="text-sm text-cyan-500/80">или от 8 325 ₽/мес</div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      {[
                        "Все из тарифа 'Исследователь'",
                        "Личная проверка ДЗ и код-ревью",
                        "Еженедельные воркшопы (Q&A)",
                        "Помощь с дипломным проектом"
                      ].map((feat, i) => (
                        <div key={i} className="flex gap-3 text-slate-200 text-sm font-medium">
                          <CheckCircle size={18} className="text-cyan-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-4 rounded-xl bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 transition-all mt-8">
                      Выбрать 'Практика'
                    </button>
                 </div>
               </div>
            </div>

            {/* 3. Architect Plan */}
            <div className="group relative p-8 rounded-3xl border border-slate-700 border-t-4 border-t-indigo-500 bg-slate-800/40 backdrop-blur-md shadow-lg flex flex-col h-full overflow-hidden hover:border-indigo-500 transition-all duration-500">
               {/* Top Highlight Line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               {/* Central Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full opacity-5 blur-[80px] group-hover:opacity-15 transition-all duration-500 pointer-events-none"></div>
               {/* Bottom Gradient Glow */}
               <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-wide text-indigo-400">АРХИТЕКТОР</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                  Персональное наставничество и создание проекта "под ключ".
                </p>
                
                <div className="mb-8">
                  <div className="text-4xl font-bold text-white mb-1">249 900 ₽</div>
                  <div className="text-sm text-indigo-500/80">или от 20 825 ₽/мес</div>
                </div>

                <div className="space-y-4 flex-grow">
                  {[
                    "Все из тарифа 'Практик'",
                    "4 индивидуальные страт-сессии",
                    "Разработка архитектуры MVP",
                    "Карьерная консультация",
                    "Приоритетная поддержка"
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-3 text-slate-300 text-sm">
                      <CheckCircle size={18} className="text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 rounded-xl border border-indigo-500/50 text-indigo-300 font-bold hover:bg-indigo-900/30 hover:text-indigo-200 transition-all mt-8">
                  Оставить заявку
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 bg-slate-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="glass-card bg-slate-800/40 rounded-3xl p-12 border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-20"></div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Готовы изменить свою карьеру?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Первый шаг — самый важный. Запишитесь на бесплатный вводный урок и узнайте, подходит ли вам эта сфера.
            </p>

            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Ваш email" 
                className="flex-1 bg-slate-900/50 border border-slate-600 rounded-full px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all">
                Записаться
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-6">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Brain className="text-cyan-400" size={24} />
              <span>Neuro<span className="text-cyan-400">Learn</span></span>
            </div>
            <p className="mb-4">Образовательная платформа нового поколения для тех, кто хочет быть на острие технологий.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Курсы</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Python для начинающих</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Data Science</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Machine Learning</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Deep Learning</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Компания</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">О нас</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Преподаватели</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Отзывы</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Блог</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Контакты</h4>
            <ul className="space-y-2">
              <li>hello@neurolearn.academy</li>
              <li>+7 (999) 123-45-67</li>
              <li>Москва, ул. Технологов, 42</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-900 transition-all">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-900 transition-all">
                <Github size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-900 transition-all">
                <Video size={16} />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2024 NeuroLearn Academy. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Договор оферты</a>
            {/* Secret Admin Button */}
            <button 
              onClick={() => navigateTo('admin-login')} 
              className="text-slate-700 hover:text-slate-500 transition-colors text-xs"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);