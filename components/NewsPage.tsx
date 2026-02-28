
import React, { useState, useEffect } from 'react';
import { User, NewsArticle, UserRole } from '../types';

interface NewsPageProps {
  user: User | null;
  notify: (msg: string, type?: any) => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ user, notify }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  const loadNews = () => {
    const savedNews = localStorage.getItem('public_news_alerts');
    let news: NewsArticle[] = savedNews ? JSON.parse(savedNews) : [];
    
    // Professionals see everything, citizens only see public news
    if (user?.role === UserRole.PUBLIC) {
      news = news.filter(a => a.targetAudience === 'Public' || !a.targetAudience);
    }
    
    setArticles(news);
  };

  useEffect(() => {
    loadNews();
    window.addEventListener('storage', loadNews);
    return () => window.removeEventListener('storage', loadNews);
  }, [user]);

  const filteredArticles = articles.filter(a => {
    const matchesDisease = filter === 'All' || a.disease === filter;
    const matchesDistrict = districtFilter === 'All Districts' || a.district === districtFilter || a.district === 'All Districts';
    return matchesDisease && matchesDistrict;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const diseases = ['All', ...Array.from(new Set(articles.map(a => a.disease)))];
  const districts = ['All Districts', 'Western Area Urban', 'Kenema', 'Bo District', 'Bombali', 'Kailahun'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Health Bulletins</h2>
          <p className="text-slate-500 font-medium">Verified news and disease updates for {user?.district}.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={districtFilter} 
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer"
          >
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {diseases.map(d => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                  filter === d ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
            <div className={`p-4 ${article.priority === 'Critical' ? 'bg-rose-50' : 'bg-slate-50'} flex items-center justify-between border-b border-slate-100`}>
              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getPriorityColor(article.priority)}`}>
                {article.priority}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {article.date}
              </span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <i className={`fa-solid ${article.disease === 'Ebola' ? 'fa-biohazard' : article.disease === 'Cholera' ? 'fa-droplet' : 'fa-virus'} text-indigo-500`}></i>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{article.disease}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-4">
                {article.content}
              </p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">By {article.author}</span>
                </div>
                {article.targetAudience === 'Internal' && (
                  <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase border border-amber-100">
                    Health Workers Only
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-24 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
            <i className="fa-solid fa-newspaper text-6xl mb-6"></i>
            <p className="text-sm font-black uppercase tracking-[0.2em]">No bulletins found for this selection</p>
          </div>
        )}
      </div>
      
      {/* Featured Emergency Card */}
      {articles.find(a => a.priority === 'Critical') && (
        <div className="bg-slate-900 rounded-[3.5rem] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-10">
            <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-3xl shrink-0 shadow-2xl shadow-rose-500/20">
              <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 block">Critical Health Advisory</span>
              <h2 className="text-3xl font-black mb-4 tracking-tight">Immediate Action Required in {user?.district}</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-3xl">
                Check the latest bulletins for emergency instructions regarding the suspected cholera cluster. Ensure all drinking water is boiled.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-95">
              Read Urgent Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
