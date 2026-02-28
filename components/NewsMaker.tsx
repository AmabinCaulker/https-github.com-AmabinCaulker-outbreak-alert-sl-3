
import React, { useState, useEffect } from 'react';
import { User, NewsArticle, Permission } from '../types';

interface NewsMakerProps {
  user: User | null;
  notify: (msg: string, type?: any) => void;
}

const NewsMaker: React.FC<NewsMakerProps> = ({ user, notify }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  
  // Fix: Explicitly type formData to allow the full range of priority and targetAudience values
  const [formData, setFormData] = useState<{
    title: string;
    disease: string;
    content: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    district: string;
    targetAudience: 'Public' | 'Internal';
  }>({
    title: '',
    disease: 'Cholera',
    content: '',
    priority: 'Medium',
    district: 'All Districts',
    targetAudience: 'Public'
  });

  const loadNews = () => {
    const savedNews = localStorage.getItem('public_news_alerts');
    setArticles(savedNews ? JSON.parse(savedNews) : []);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      notify("Please provide a heading and content.", "warning");
      return;
    }

    const savedNews = localStorage.getItem('public_news_alerts');
    const existingNews: NewsArticle[] = savedNews ? JSON.parse(savedNews) : [];

    if (editingArticle) {
      const updatedNews = existingNews.map(a => 
        a.id === editingArticle.id ? { ...a, ...formData } : a
      );
      localStorage.setItem('public_news_alerts', JSON.stringify(updatedNews));
      notify("Bulletin Updated", "success");
      setEditingArticle(null);
    } else {
      const newArticle: NewsArticle = {
        id: `NW-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        ...formData,
        author: user?.name || 'Administrator',
        date: new Date().toLocaleDateString(),
        published: true
      };
      const updatedNews = [newArticle, ...existingNews];
      localStorage.setItem('public_news_alerts', JSON.stringify(updatedNews));
      notify("Bulletin Published to National Portal", "success");
    }

    setFormData({
      title: '',
      disease: 'Cholera',
      content: '',
      priority: 'Medium',
      district: 'All Districts',
      targetAudience: 'Public'
    });
    loadNews();
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    // Fix: Correctly update formData using the article values, ensuring union type compatibility
    setFormData({
      title: article.title,
      disease: article.disease,
      content: article.content,
      priority: article.priority,
      district: article.district,
      targetAudience: (article.targetAudience as 'Public' | 'Internal') || 'Public'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this bulletin?")) {
      const updated = articles.filter(a => a.id !== id);
      localStorage.setItem('public_news_alerts', JSON.stringify(updated));
      setArticles(updated);
      notify("Bulletin Deleted", "info");
    }
  };

  if (!user?.permissions.includes(Permission.MANAGE_SETTINGS)) {
    return <div className="p-20 text-center text-slate-400 font-black uppercase">Restricted Access</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Bulletin Manager</h2>
          <p className="text-slate-500 font-medium">Create and manage news for citizens and health workers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* News Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 sticky top-24">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
              <i className={`fa-solid ${editingArticle ? 'fa-pen-to-square' : 'fa-plus'} text-indigo-500 mr-3`}></i>
              {editingArticle ? 'Edit Bulletin' : 'Draft New Bulletin'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Article Heading</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-400 transition-all outline-none" 
                  placeholder="e.g. Cholera clusters in Aberdeen..." 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Disease Focus</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none"
                    value={formData.disease}
                    onChange={e => setFormData({...formData, disease: e.target.value})}
                  >
                    {['Cholera', 'Lassa Fever', 'Ebola', 'Malaria', 'General'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target District</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none"
                    value={formData.district}
                    onChange={e => setFormData({...formData, district: e.target.value})}
                  >
                    {['All Districts', 'Western Area Urban', 'Kenema', 'Bo District', 'Bombali', 'Kailahun'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Audience</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none"
                    value={formData.targetAudience}
                    onChange={e => setFormData({...formData, targetAudience: e.target.value as any})}
                  >
                    <option value="Public">Public (Everyone)</option>
                    <option value="Internal">Internal (Health Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Content Body</label>
                <textarea 
                  rows={8} 
                  className="w-full px-5 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium focus:bg-white focus:border-indigo-400 transition-all outline-none resize-none" 
                  placeholder="Detailed health advice or technical briefing..."
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                {editingArticle && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingArticle(null); setFormData({ title: '', disease: 'Cholera', content: '', priority: 'Medium', district: 'All Districts', targetAudience: 'Public' }); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  {editingArticle ? 'Save Changes' : 'Post Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Articles */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
            <h3 className="text-xl font-black text-slate-900 mb-8">System Bulletins</h3>
            <div className="space-y-4">
              {articles.map(article => (
                <div key={article.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="flex-1 space-y-2 pr-6">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        article.priority === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {article.priority}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {article.district} • {article.targetAudience || 'Public'}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{article.title}</h4>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{article.content}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleEdit(article)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))}
              
              {articles.length === 0 && (
                <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-slate-400">
                  No bulletins published yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsMaker;
