import React, { useState, useEffect, useCallback } from 'react';
import { adminService, BlogPost } from '../../services/adminService';
import { BlogPostForm } from '../forms/BlogPostForm';
import { Article, Add, Edit, Delete } from '@mui/icons-material';

export const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | 'new' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const data = await adminService.getAdminPosts();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSave = () => {
    setEditingPost(null);
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await adminService.deletePost(postId);
      fetchPosts();
    }
  };

  if (editingPost) {
    return <BlogPostForm post={editingPost === 'new' ? undefined : editingPost} onSave={handleSave} onCancel={() => setEditingPost(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Article className="text-amber-500" />
            Blog Management
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Publish, edit, and curate marketing articles, driver bulletins, and platform news.
          </p>
        </div>
        <button
          onClick={() => setEditingPost('new')}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2.5 rounded text-sm font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Add fontSize="small" />
          Create New Post
        </button>
      </div>

      <div className="bg-[#131722] border border-white/10 rounded shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-[#131722] flex justify-between items-center">
          <h3 className="font-semibold text-white">All Blog Publications</h3>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded">
            {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-[#0a0a0a] text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th className="px-6 py-3.5 text-left">Post</th>
                <th className="px-6 py-3.5 text-left">Author</th>
                <th className="px-6 py-3.5 text-left">Workflow Status</th>
                <th className="px-6 py-3.5 text-left">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#131722] divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Loading publications...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center">
                      <Article className="text-amber-500/40 text-5xl mb-2" />
                      <p>No blog posts found.</p>
                      <button
                        onClick={() => setEditingPost('new')}
                        className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium"
                      >
                        Create your first article
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-[#0a0a0a] border border-white/10">
                          <img 
                            src={post.imageUrl || 'https://placehold.co/160x100?text=No+Image'} 
                            alt={post.title || "Post thumbnail"} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{post.title}</div>
                          <div className="text-xs text-slate-400 truncate max-w-sm mt-0.5">{post.summary}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400">
                          {post.authorName?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm text-slate-300 font-medium">{post.authorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wider rounded ${
                        post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        post.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 
                        'bg-slate-800 text-slate-400 border border-white/10'
                      }`}>
                        {post.status?.replace('_', ' ') || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
                      {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingPost(post)} 
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
                          title="Edit Post"
                        >
                          <Edit fontSize="small" />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)} 
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete Post"
                        >
                          <Delete fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
