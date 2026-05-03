import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
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
      summary: content.substring(0, 160).replace(/<[^>]+>/g, '') + '...', // Enhanced summary
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{post ? 'Edit' : 'Create'} Blog Post</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900"
                placeholder="Enter a catchy title..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900"
                placeholder="Author"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Featured Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Featured Image Preview</div>
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                <img 
                  src={imageUrl} 
                  alt="Featured Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-xs">Image will be cropped to 16:9</span>
              </div>
            )}
            <p className="mt-3 text-[10px] text-gray-500 text-center">
              All blog images maintain a standard 16:9 aspect ratio for consistency across the platform.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
          <div className="bg-white">
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Workflow Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full md:w-64 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900 font-medium"
          >
            <option value="DRAFT">📝 Draft (Internal Only)</option>
            <option value="PENDING_APPROVAL">⏳ Ready for Approval (Notify Manager)</option>
            {canPublish && <option value="PUBLISHED">🚀 Published (Live on Site)</option>}
          </select>
          {!canPublish && status === 'PUBLISHED' && (
            <p className="mt-2 text-xs text-amber-600 font-medium italic">
              * Only Senior Managers can publish to the live site.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};