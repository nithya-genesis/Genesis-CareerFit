import React, { useState, useEffect } from 'react';
import { getCareerUniverse } from '../services/api';

export default function CareerExplorer() {
  const [roles, setRoles] = useState([]);
  const [counts, setCounts] = useState({ TECH: 18, NON_TECH: 17, CROSS_DOMAIN: 10 });
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, [activeCategory, searchQuery]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await getCareerUniverse(activeCategory, searchQuery);
      setRoles(data.roles || []);
      if (data.categories) {
        setCounts(data.categories);
      }
    } catch (err) {
      console.error('Failed to load career universe:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = (counts.TECH || 0) + (counts.NON_TECH || 0) + (counts.CROSS_DOMAIN || 0) || 45;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Career Universe &amp; Role Explorer</h1>
          <p className="text-sm text-gray-500 mt-1">45+ branch-aware career pathways, competency criteria, and industry compensation bands.</p>
        </div>
        
        {/* Search input */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search roles, domains, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: `All Roles (${totalCount})` },
          { id: 'TECH', label: `Technical (${counts.TECH || 18})` },
          { id: 'NON_TECH', label: `Non-Technical (${counts.NON_TECH || 17})` },
          { id: 'CROSS_DOMAIN', label: `Cross-Domain (${counts.CROSS_DOMAIN || 10})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
              activeCategory === tab.id
                ? 'bg-black text-yellow-400 border border-black shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading Career Universe pathways...</div>
      ) : roles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
          No career pathways matching &quot;{searchQuery}&quot; in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r, idx) => (
            <div key={r.role || idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 hover:border-yellow-400 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                    r.category === 'TECH' ? 'bg-blue-100 text-blue-900' :
                    r.category === 'NON_TECH' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-purple-100 text-purple-900'
                  }`}>
                    {r.category === 'TECH' ? 'Technical' : r.category === 'NON_TECH' ? 'Non-Technical' : 'Cross-Domain'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">{r.domain}</span>
                </div>

                <h2 className="text-base font-bold text-gray-900">{r.title || r.role}</h2>
                <p className="text-xs text-gray-600 line-clamp-2">{r.description}</p>

                <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
                  <div><strong className="text-gray-900">Target Branches:</strong> {r.target_branches ? r.target_branches.join(', ') : 'All Branches'}</div>
                  <div><strong className="text-gray-900">Compensation Band:</strong> {r.salary_band || '6 – 14 LPA'}</div>
                  <div><strong className="text-gray-900">Academic CGPA Cutoff:</strong> {r.min_cgpa ? `${r.min_cgpa} CGPA` : '6.0 CGPA'}</div>
                </div>
              </div>

              {/* Skills Tags */}
              {r.skills && r.skills.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Key Competencies:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.skills.slice(0, 4).map((sk, sidx) => (
                      <span key={sidx} className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                    {r.skills.length > 4 && (
                      <span className="bg-gray-50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">
                        +{r.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
