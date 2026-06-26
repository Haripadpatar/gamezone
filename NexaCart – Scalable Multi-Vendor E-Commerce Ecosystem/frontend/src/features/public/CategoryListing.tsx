import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { Layers, ChevronRight, AlertTriangle } from 'lucide-react';
import PageLoader from '../../core/components/PageLoader';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  subCategories?: Category[];
}

const CategoryListing: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/api/v1/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err: any) {
        setError('Failed to load category hierarchy');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="text-yellow-500 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#090d16] text-white min-h-screen py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-white">All Categories</h1>
          <p className="text-slate-400 text-sm mt-2">Explore the full catalog catalog hierarchy</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 bg-[#0c1222]/55 border border-slate-850 rounded-2xl text-slate-400">
            No categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#0c1222]/65 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-500">{cat.description || 'Verified Category'}</p>
                  </div>
                </div>

                {cat.subCategories && cat.subCategories.length > 0 ? (
                  <div className="flex-1 space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Subcategories</p>
                    {cat.subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/products?category=${sub.slug}`}
                        className="flex items-center justify-between text-sm text-slate-400 hover:text-white py-1 px-2 rounded-lg hover:bg-slate-800/40 transition-all"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight size={14} className="text-slate-600" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-slate-500 italic mt-4">
                    No subcategories available.
                  </div>
                )}

                <div className="pt-6 border-t border-slate-850 mt-6">
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="w-full py-2.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-400 text-center font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>Browse All in {cat.name}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListing;
