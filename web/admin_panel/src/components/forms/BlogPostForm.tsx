import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adminService, BlogPost } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  post?: BlogPost;
  onSave: () => void;
  onCancel: () => void;
}

export const BlogPostForm: React.FC<Props> = ({ post, onSave, onCancel }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [authorName, setAuthorName] = useState(post?.authorName || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [status, setStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED'>(post?.status || 'DRAFT');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is a senior manager or admin
  const role = (user?.role as string)?.toUpperCase();
  const canPublish = role === 'ADMIN' || role === 'SUPER_ADMIN' || user?.permissions?.includes('BLOG_POSTS_PUBLISH' as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      title,
      content,
      authorName,
      status,
      summary: content.substring(0, 160).replace(/<[^>]+>/g, '') + '...',
      imageUrl,
    };

    try {
      if (post) {
        await adminService.updatePost(post.id, payload);
      } else {
        await adminService.createPost(payload);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save post', error);
      alert('Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#131722] p-6 rounded border border-white/10 shadow-2xl max-w-4xl mx-auto text-white">
      <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-3">
        {post ? 'Edit' : 'Create'} Blog Post
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-500 text-sm"
                placeholder="Enter article title..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-500 text-sm"
                placeholder="e.g. Cabi Editorial Team"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Featured Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-slate-500 text-sm"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded bg-[#0a0a0a]/50 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Featured Image Preview</div>
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded overflow-hidden shadow-md border border-white/10">
                <img 
                  src={imageUrl} 
                  alt="Featured Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 py-6">
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-xs">Image standard ratio 16:9</span>
              </div>
            )}
            <p className="mt-3 text-[10px] text-slate-500 text-center">
              All editorial banners maintain a standard 16:9 aspect ratio across the mobile and web portals.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Article Content</label>
          <div className="dark-quill rounded overflow-hidden">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="h-64 mb-12"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
          </div>
        </div>

        <div className="pt-8">
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Workflow Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full md:w-64 bg-[#0a0a0a] border border-white/10 rounded text-white p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm font-medium"
          >
            <option value="DRAFT">📝 Draft (Internal Only)</option>
            <option value="PENDING_APPROVAL">⏳ Ready for Approval (Notify Manager)</option>
            {canPublish && <option value="PUBLISHED">🚀 Published (Live on Site)</option>}
          </select>
          {!canPublish && status === 'PUBLISHED' && (
            <p className="mt-2 text-xs text-amber-400 font-medium italic">
              * Only Senior Managers can publish to the live site.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 px-6 py-2.5 rounded font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-2.5 rounded font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
