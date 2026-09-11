import {
  Bookmark,
  Download,
  FileCode,
  FileText,
  Flag,
  Heart,
  Image as ImageIcon,
  Maximize2,
  MessageCircle,
  Paperclip,
  Plus,
  Reply,
  Send,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { useSkillSwap, type CommunityAttachment } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";
import { UserAvatar } from "@/components/UserAvatar";

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function isImageAttachment(att: CommunityAttachment) {
  return (
    att.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(att.name)
  );
}

function isCodeAttachment(att: CommunityAttachment) {
  return (
    /\.(ts|tsx|js|jsx|json|py|html|css|sql|sh|rs|go|cpp|c|h|glsl)$/i.test(att.name) ||
    att.type.includes("javascript") ||
    att.type.includes("json")
  );
}

export default function CommunityRepair() {
  const [location] = useLocation();
  const { account } = useAccount();
  const {
    state,
    addCommunityPost,
    toggleCommunityReaction,
    toggleCommunitySave,
    addCommunityComment,
    reportCommunityPost,
    shareCommunityPost,
  } = useSkillSwap();

  const [composerOpen, setComposerOpen] = useState(false);
  const [type, setType] = useState("Ask Question");
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<CommunityAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewModalAttachment, setPreviewModalAttachment] = useState<CommunityAttachment | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<{ postId: string; commentId: string } | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");

  const author = account?.name ?? "SkillSwap member";
  const avatar = account?.avatar ?? "SS";
  const focusedPostId = new URLSearchParams(window.location.search).get("post");

  const handleFileSelect = (files: FileList | File[] | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);

    const readPromises = fileArray.map((file) => {
      return new Promise<CommunityAttachment | null>((resolve) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 10MB limit.`);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            url: e.target?.result as string,
          });
        };
        reader.onerror = () => {
          toast.error(`Could not read "${file.name}"`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((results) => {
      const valid = results.filter((r): r is CommunityAttachment => r !== null);
      setAttachments((prev) => [...prev, ...valid]);
      setIsUploading(false);
      if (valid.length > 0) {
        toast.success(`Attached ${valid.length} file${valid.length > 1 ? "s" : ""}`);
      }
    });
  };

  const downloadAttachment = (att: CommunityAttachment) => {
    const a = document.createElement("a");
    a.href = att.url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${att.name}`);
  };

  const publish = () => {
    if (!draft.trim() && attachments.length === 0) return;
    addCommunityPost(type, draft.trim(), author, avatar, attachments);
    setDraft("");
    setAttachments([]);
    setComposerOpen(false);
    toast.success("Community post published!");
  };

  const addComment = (postId: string, parentCommentId?: string) => {
    const key = parentCommentId ? `${postId}:${parentCommentId}` : postId;
    const text = commentDrafts[key]?.trim();
    if (!text) return;
    addCommunityComment(postId, text, author, avatar, parentCommentId);
    setCommentDrafts((current) => ({ ...current, [key]: "" }));
    setReplyTarget(null);
  };

  const recordShare = (option: string) => {
    if (!sharePostId) return;
    shareCommunityPost(sharePostId);
    setSharePostId(null);
  };

  const submitReport = () => {
    if (!reportPostId) return;
    reportCommunityPost(reportPostId);
    setReportPostId(null);
    setReportDescription("");
  };

  return (
    <div className="community-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 relative">
      <PageSEO
        title="Community Exchange & Discussion"
        description="Collaborate with creators, share project breakthroughs, ask technical questions, and connect in real time on SkillSwap."
        canonicalPath="/community"
      />
      {/* Hero from Stitch */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 z-10">
        <div className="max-w-2xl">
          <p className="page-kicker">COMMUNITY EXCHANGE</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Share the work behind the <span className="text-white underline">skill.</span>
          </h1>
          <p className="text-base text-gray-400 leading-relaxed">
            Collaborate, ask questions, share project breakthroughs, and connect with fellow creators in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
            className="primary-action text-xs px-5 py-2.5 bg-white text-black font-bold hover:bg-zinc-200 border border-white cursor-pointer"
            onClick={() => {
              setType("Create Post");
              setComposerOpen(true);
            }}
          >
            <Plus size={16} className="text-black" style={{ color: "#000000" }} />
            <span style={{ color: "#000000", fontWeight: 800 }}>Create Post</span>
          </button>
          <button
            className="secondary-action text-xs px-5 py-2.5"
            onClick={() => {
              setType("Ask Question");
              setComposerOpen(true);
            }}
          >
            Ask Question
          </button>
        </div>
      </section>

      {/* Composer Modal/Drawer */}
      {composerOpen && (
        <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-4 border-white/20 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="page-kicker">{type.toUpperCase()}</p>
              <h2 className="text-xl font-bold text-white">Create a Community Post</h2>
            </div>
            <button
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              onClick={() => setComposerOpen(false)}
              aria-label="Close composer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Ask Question", "Share Project", "Share Achievement", "Share Resource"].map((item) => (
              <button
                key={item}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  type === item
                    ? "bg-white text-black font-bold border-white"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                }`}
                onClick={() => setType(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            className={`relative rounded-2xl transition-all ${
              isDragOver ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
            }`}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                type === "Ask Question"
                  ? "What question or challenge are you working through?"
                  : "Describe your project progress, tools used, or insights gained..."
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-white min-h-[120px]"
            />
            {isDragOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white flex flex-col items-center justify-center pointer-events-none text-white gap-2">
                <Paperclip size={24} className="animate-bounce" />
                <span className="text-xs font-bold">Drop files here to attach to this post</span>
              </div>
            )}
          </div>

          {/* Staged Attachments Tray */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/10 rounded-2xl">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white"
                >
                  {isImageAttachment(att) ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-9 h-9 object-cover rounded-lg border border-white/20 shrink-0"
                    />
                  ) : isCodeAttachment(att) ? (
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCode size={18} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 max-w-[160px]">
                    <span className="truncate font-medium text-[11px] text-white">{att.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{formatBytes(att.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors ml-1 cursor-pointer"
                    aria-label={`Remove ${att.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <label
                className={`secondary-action text-xs px-3.5 py-2 cursor-pointer flex items-center gap-2 transition-all ${
                  isUploading ? "opacity-50 pointer-events-none" : "hover:border-white/40"
                }`}
                title="Attach images, documents, code, or archives (up to 10MB)"
              >
                <Paperclip size={14} className="text-white" />
                <span>{isUploading ? "Reading files..." : "Attach File"}</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.ts,.tsx,.js,.jsx,.py,.zip,.csv,.glsl"
                />
              </label>
              {attachments.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">
                  {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button className="secondary-action text-xs" onClick={() => setComposerOpen(false)}>
                Cancel
              </button>
              <button
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="primary-action text-xs px-6 bg-white text-black font-bold hover:bg-zinc-200 border border-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={!draft.trim() && attachments.length === 0}
                onClick={publish}
              >
                <span style={{ color: "#000000", fontWeight: 800 }}>Publish Post</span>{" "}
                <Send size={14} className="text-black ml-1 inline" style={{ color: "#000000" }} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Feed */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="page-kicker">COMMUNITY FEED</p>
            <h2 className="text-2xl font-bold text-white">
              {focusedPostId ? "Focused Discussion" : "Recent Discussions"}
            </h2>
          </div>
          <span className="text-xs text-gray-400">{state.communityPosts.length} posts</span>
        </div>

        {state.communityPosts.length ? (
          <div className="grid grid-cols-1 gap-6">
            {state.communityPosts.map((post) => (
              <article
                key={post.id}
                className={`glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-4 transition-all ${
                  focusedPostId === post.id ? "border-white/30" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar src={post.avatar} name={post.author} size="md" rounded="2xl" />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-white font-bold">{post.author}</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 uppercase tracking-wider font-semibold">
                        {post.type}
                      </span>
                    </div>
                    <small className="text-[11px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <p className="text-sm md:text-base text-gray-200 leading-relaxed">{post.text}</p>

                {/* Attached Files & Media */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="flex flex-col gap-3 my-2">
                    {/* Images Grid */}
                    {post.attachments.filter(isImageAttachment).length > 0 && (
                      <div
                        className={`grid gap-2.5 rounded-2xl overflow-hidden ${
                          post.attachments.filter(isImageAttachment).length === 1
                            ? "grid-cols-1 max-w-xl"
                            : post.attachments.filter(isImageAttachment).length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        }`}
                      >
                        {post.attachments.filter(isImageAttachment).map((att) => (
                          <div
                            key={att.id}
                            className="group relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 cursor-pointer max-h-80 aspect-video flex items-center justify-center transition-all hover:border-white/40 shadow-md"
                            onClick={() => setPreviewModalAttachment(att)}
                            title={`View ${att.name} (${formatBytes(att.size)})`}
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                              <span className="px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl">
                                <Maximize2 size={13} /> View Image
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] text-zinc-300 font-mono border border-white/10">
                              {formatBytes(att.size)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents / Code / Files */}
                    {post.attachments.filter((a) => !isImageAttachment(a)).length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {post.attachments
                          .filter((a) => !isImageAttachment(a))
                          .map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-3 rounded-2xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/30 transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
                                  {isCodeAttachment(att) ? (
                                    <FileCode size={18} className="text-emerald-400" />
                                  ) : (
                                    <FileText size={18} className="text-white" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold text-white truncate group-hover:text-zinc-200">
                                    {att.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    {formatBytes(att.size)}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAttachment(att);
                                }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black transition-all shrink-0 ml-2 cursor-pointer"
                                title={`Download ${att.name}`}
                                aria-label={`Download ${att.name}`}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {post.reported && (
                  <p className="text-xs text-white bg-white/10 p-3 rounded-xl border border-white/20">
                    You reported this post. It remains marked for review.
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  <button
                    className={`secondary-action text-xs px-3 py-1.5 ${
                      post.appreciated ? "bg-white/15 text-white border-white/30" : ""
                    }`}
                    onClick={() => toggleCommunityReaction(post.id)}
                  >
                    <Heart size={14} fill={post.appreciated ? "currentColor" : "none"} />
                    <span>{post.appreciated ? "Appreciated" : "Appreciate"}</span>
                  </button>

                  <button
                    className="secondary-action text-xs px-3 py-1.5"
                    onClick={() =>
                      setCommentDrafts((current) => ({ ...current, [post.id]: current[post.id] ?? "" }))
                    }
                  >
                    <MessageCircle size={14} />
                    <span>Comments ({post.comments.length})</span>
                  </button>

                  <button
                    className={`secondary-action text-xs px-3 py-1.5 ${
                      post.saved ? "bg-white/15 text-white border-white/30" : ""
                    }`}
                    onClick={() => toggleCommunitySave(post.id)}
                  >
                    <Bookmark size={14} fill={post.saved ? "currentColor" : "none"} />
                    <span>{post.saved ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    className="secondary-action text-xs px-3 py-1.5"
                    onClick={() => setSharePostId(post.id)}
                  >
                    <Share2 size={14} />
                    <span>Share {post.shareCount ? `(${post.shareCount})` : ""}</span>
                  </button>

                  <button
                    className="secondary-action text-xs px-3 py-1.5 text-gray-400 hover:text-red-400"
                    onClick={() => setReportPostId(post.id)}
                  >
                    <Flag size={14} />
                  </button>
                </div>

                {/* Comment Composer */}
                {Object.prototype.hasOwnProperty.call(commentDrafts, post.id) && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(event) =>
                        setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-white"
                    />
                    <button
                      className="primary-action text-xs px-4 bg-white text-black font-bold hover:bg-zinc-200 border border-white"
                      disabled={!commentDrafts[post.id]?.trim()}
                      onClick={() => addComment(post.id)}
                    >
                      Post
                    </button>
                  </div>
                )}

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="flex flex-col gap-3 pt-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <UserAvatar src={comment.avatar} name={comment.author} size="xs" />
                          <strong className="text-xs text-white">{comment.author}</strong>
                          <small className="text-[10px] text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="text-xs text-gray-300 ml-8">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <MessageCircle size={32} className="text-gray-500" />
            <h3 className="text-lg font-bold text-white">No discussions yet</h3>
            <p className="text-xs text-gray-400">Ask a question or post a project to start the conversation.</p>
            <button
              className="primary-action text-xs mt-2"
              onClick={() => {
                setType("Ask Question");
                setComposerOpen(true);
              }}
            >
              Ask First Question
            </button>
          </div>
        )}
      </section>

      {/* Share Modal */}
      {sharePostId && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close share options" onClick={() => setSharePostId(null)}>
            ×
          </button>
          <p className="page-kicker">SHARE DISCUSSION</p>
          <h3 className="text-xl font-bold text-white">Share Post</h3>
          <p className="text-xs text-gray-400">Select where you want to share this discussion.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {["Copy link", "WhatsApp", "Email", "Other"].map((option) => (
              <button
                key={option}
                className={option === "Copy link" ? "primary-action text-xs" : "secondary-action text-xs"}
                onClick={() => recordShare(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportPostId && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close report" onClick={() => setReportPostId(null)}>
            ×
          </button>
          <p className="page-kicker">REPORT POST</p>
          <h3 className="text-xl font-bold text-white">Submit a Report</h3>
          <select
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            {["Spam", "Harassment", "Misinformation", "Inappropriate content", "Copyright", "Other"].map(
              (reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              )
            )}
          </select>
          <textarea
            value={reportDescription}
            onChange={(event) => setReportDescription(event.target.value)}
            placeholder="Optional additional context..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
            rows={3}
          />
          <button className="primary-action text-xs justify-center" onClick={submitReport}>
            Submit Report
          </button>
        </div>
      )}

      {/* Attachment Image Lightbox Modal */}
      {previewModalAttachment && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalAttachment(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-3 p-4 sm:p-5 bg-black/95 border border-white/20 rounded-3xl shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <ImageIcon size={18} className="text-white shrink-0" />
                <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {previewModalAttachment.name}
                </span>
                <span className="text-xs text-zinc-400 font-mono shrink-0">
                  ({formatBytes(previewModalAttachment.size)})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadAttachment(previewModalAttachment)}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Download size={13} /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalAttachment(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close image preview"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-auto flex items-center justify-center w-full max-h-[75vh] p-1">
              <img
                src={previewModalAttachment.url}
                alt={previewModalAttachment.name}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
