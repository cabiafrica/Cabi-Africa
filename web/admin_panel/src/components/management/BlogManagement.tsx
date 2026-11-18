import React, { useState, useEffect, useCallback } from 'react';
import { adminService, BlogPost } from '../../services/adminService';
import { BlogPostForm } from '../forms/BlogPostForm';

export const BlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | 'new' | null>(null);

  const fetchPosts = useCallback(async () => {
    const data = await adminService.getAdminPosts();
    setPosts(data);
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">Blog Post Management</h2>
        <button
          onClick={() => setEditingPost('new')}
          className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create New Post
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4 text-left">Post</th>
              <th className="px-6 py-4 text-left">Author</th>
              <th className="px-6 py-4 text-left">Workflow Status</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                      <img 
                        src={post.imageUrl || 'https://placehold.co/160x100?text=No+Image'} 
                        alt={post.title || "Post thumbnail"} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">{post.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{post.summary}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {post.authorName?.charAt(0) || 'A'}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{post.authorName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wider rounded-full ${
                    post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 
                    post.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 animate-pulse' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {post.status?.replace('_', ' ') || 'DRAFT'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                  {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingPost(post)} 
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      title="Edit Post"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No blog posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};