import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { ProspectPost } from '../../types/blueprint-types';

// ============================================
// Types
// ============================================

interface ContentRoadmapProps {
  posts: ProspectPost[];
}

// ============================================
// Constants
// ============================================

const INITIAL_DISPLAY_COUNT = 12;

// ============================================
// Copy Button Component
// ============================================

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
      aria-label={copied ? 'Copied!' : 'Copy post content'}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

// ============================================
// Status Badge Component
// ============================================

interface StatusBadgeProps {
  postReady?: boolean;
  toFix?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ postReady, toFix }) => {
  if (postReady) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
        Ready
      </span>
    );
  }

  if (toFix) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
        Needs Review
      </span>
    );
  }

  return null;
};

// ============================================
// Post Card Component
// ============================================

interface PostCardProps {
  post: ProspectPost;
  isExpanded: boolean;
  onToggle: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isExpanded, onToggle }) => {
  const hasContent = post.postContent && post.postContent.trim() !== '';
  const hasFirstSentence = post.firstSentence && post.firstSentence.trim() !== '';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="p-4">
        {/* Top Row: Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <StatusBadge postReady={post.postReady} toFix={post.toFix} />
          {post.number && <span className="text-xs text-zinc-500 font-medium">#{post.number}</span>}
        </div>

        {/* Title */}
        {post.name && (
          <h4 className="font-semibold text-zinc-100 mb-2 line-clamp-2" title={post.name}>
            {post.name}
          </h4>
        )}

        {/* Preview Text */}
        {hasFirstSentence && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{post.firstSentence}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasContent && (
            <button
              onClick={onToggle}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show more</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && hasContent && (
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Full Post Content
            </h5>
            <CopyButton text={post.postContent!} />
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
              {post.postContent}
            </pre>
          </div>

          {/* Action Items (if any) */}
          {post.actionItems && post.actionItems.trim() !== '' && (
            <div className="mt-4">
              <h5 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">
                Action Items
              </h5>
              <p className="text-sm text-zinc-400 leading-relaxed">{post.actionItems}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Empty State Component
// ============================================

const EmptyState: React.FC = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-zinc-300 mb-2">No Posts Yet</h3>
    <p className="text-sm text-zinc-500">
      Your personalized content roadmap will appear here once generated.
    </p>
  </div>
);

// ============================================
// ContentRoadmap Component
// ============================================

const ContentRoadmap: React.FC<ContentRoadmapProps> = ({ posts }) => {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Sort posts by number if available, otherwise by creation date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.number !== undefined && b.number !== undefined) {
      return a.number - b.number;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Determine how many posts to display
  const displayedPosts = showAll ? sortedPosts : sortedPosts.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMorePosts = sortedPosts.length > INITIAL_DISPLAY_COUNT;
  const remainingCount = sortedPosts.length - INITIAL_DISPLAY_COUNT;

  // Count ready posts
  const readyCount = posts.filter((p) => p.postReady).length;

  const togglePost = (postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Don't render if there are no posts
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">YOUR CONTENT ROADMAP</h2>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">60-DAY CONTENT ROADMAP</h2>
        <span className="text-sm text-zinc-400">
          {readyCount > 0 ? (
            <>
              <span className="text-green-400 font-medium">{readyCount}</span> of {posts.length}{' '}
              posts ready for you
            </>
          ) : (
            <>{posts.length} posts ready for you</>
          )}
        </span>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isExpanded={expandedPosts.has(post.id)}
            onToggle={() => togglePost(post.id)}
          />
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {hasMorePosts && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show fewer posts
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {remainingCount} more {remainingCount === 1 ? 'post' : 'posts'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentRoadmap;
