'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Send, Search, 
  MessageSquare, Heart, Share2, 
  Users, Stethoscope, TrendingUp, AlertTriangle,
  ArrowLeft, MoreHorizontal, X, Flag
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

// --- Types ---
type PostType = 'update' | 'question' | 'alert'

interface Profile {
  fullname: string
  avatar_url?: string
}

interface Comment {
  id: number
  post_id: number
  user_id: string
  content: string
  created_at: string
  profiles?: Profile // Joined profile data
}

interface Post {
  id: number
  user_id: string
  content: string
  post_type: PostType
  latitude: number
  longitude: number
  created_at: string
  likes: string[] | null // Array of user_ids who liked
  profiles?: Profile | Profile[] // Joined profile data
  // Legacy field, fallback
  author_name?: string 
}

export default function CommunityPage() {
  const router = useRouter()
  const { user } = useSupabaseUser()
  
  // -- STATE --
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [postType, setPostType] = useState<PostType>('update')
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeTab, setActiveTab] = useState('feed') 
  
  // Comment State
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState(false)

  // Report State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingPostId, setReportingPostId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

  // -- 1. GET USER LOCATION --
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setLocation(loc)
          fetchPosts(loc.lat, loc.lng)
        },
        (err) => {
          console.error("Location error or denied:", err)
          fetchPosts(0, 0, true) 
        },
        { timeout: 10000 } 
      )
    } else {
      fetchPosts(0, 0, true)
    }
  }, [])

  // -- 2. FETCH POSTS (With Fallback) --
  const fetchPosts = async (lat: number, lng: number, global = false) => {
    const range = 0.5 
    
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          profiles (fullname, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (!global && lat !== 0) {
        query = query
          .gte('latitude', lat - range)
          .lte('latitude', lat + range)
          .gte('longitude', lng - range)
          .lte('longitude', lng + range)
      }

      const { data, error } = await query

      if (error) throw error

      setPosts(data as Post[])
      
    } catch (err) {
      console.warn("Relational fetch failed, falling back to simple fetch.", err)
      
      let simpleQuery = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!global && lat !== 0) {
        simpleQuery = simpleQuery
          .gte('latitude', lat - range)
          .lte('latitude', lat + range)
          .gte('longitude', lng - range)
          .lte('longitude', lng + range)
      }

      const { data: simpleData, error: simpleError } = await simpleQuery
      
      if (simpleError) {
        console.error("Critical: Could not fetch posts.", simpleError)
      } else {
        setPosts(simpleData as Post[])
      }
    } finally {
      setLoading(false)
    }
  }

  // -- 3. HANDLE ACTIONS --

  const handlePost = async () => {
    if (!newPost.trim() || !user) return
    
    const lat = location?.lat || 0
    const lng = location?.lng || 0

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content: newPost,
      post_type: postType,
      latitude: lat,
      longitude: lng,
      likes: [], 
      author_name: user.user_metadata?.full_name || "FarmSeva User" 
    })

    if (!error) {
      setNewPost('')
      fetchPosts(lat, lng, lat === 0) 
    } else {
      alert("Failed to post. Please try again.")
    }
  }

  const handleLike = async (postId: number, currentLikes: string[] | null) => {
    if (!user) return alert("Please log in to like posts")
    
    // Ensure likesArr is always an array
    const likesArr = Array.isArray(currentLikes) ? currentLikes : []
    const hasLiked = likesArr.includes(user.id)
    
    // Optimistic UI Update
    const updatedLikes = hasLiked 
      ? likesArr.filter(id => id !== user.id)
      : [...likesArr, user.id]

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedLikes } : p))

    // DB Update
    const { error } = await supabase
      .from('community_posts')
      .update({ likes: updatedLikes })
      .eq('id', postId)

    if (error) {
      // Use WARN instead of ERROR to prevent Next.js overlay
      console.warn("Like update failed (check RLS policies):", error.message)
      
      // Revert if failed
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: likesArr } : p))
      
      // Optional: Inform user subtly
      // alert("Could not save like. You might not have permission to update this post.")
    }
  }

  const handleShare = async (post: Post) => {
    const shareData = {
      title: 'FarmSeva Community',
      text: post.content,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share canceled')
      }
    } else {
      navigator.clipboard.writeText(`${post.content} - Shared from FarmSeva`)
      alert('Post content copied to clipboard!')
    }
  }

  const toggleComments = async (postId: number) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null)
      return
    }
    
    setActiveCommentId(postId)
    
    if (!comments[postId]) {
      setLoadingComments(true)
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`*, profiles (fullname)`)
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          
        if (error) throw error
        setComments(prev => ({...prev, [postId]: data as unknown as Comment[] }))
      } catch (e) {
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          
        if (data) setComments(prev => ({...prev, [postId]: data as unknown as Comment[] }))
      }
      setLoadingComments(false)
    }
  }

  const submitComment = async (postId: number) => {
    if (!newComment.trim() || !user) return

    const tempComment: Comment = {
      id: Date.now(),
      post_id: postId,
      user_id: user.id,
      content: newComment,
      created_at: new Date().toISOString(),
      profiles: { fullname: user.user_metadata?.full_name || 'Me' }
    }
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment]
    }))
    setNewComment('')

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: tempComment.content
    })

    if (error) {
      console.warn("Comment failed:", error.message)
    }
  }

  // --- REPORTING LOGIC ---
  const openReportModal = (postId: number) => {
    setReportingPostId(postId)
    setReportModalOpen(true)
    setMenuOpenId(null) // Close menu
  }

  const submitReport = async () => {
    if (!reportReason) return alert("Please select a reason.")
    
    // Simulate DB call (Replace with actual insert if 'reports' table exists)
    // await supabase.from('reports').insert({ post_id: reportingPostId, reason: reportReason, user_id: user?.id })
    
    // Mock success
    setTimeout(() => {
        alert("Thanks for reporting. We will review this post shortly.")
        setReportModalOpen(false)
        setReportReason('')
        setReportingPostId(null)
    }, 500)
  }

  // -- HELPERS --
  const displayPosts = posts.filter(p => {
    if (activeTab === 'questions') return p.post_type === 'question'
    if (activeTab === 'alerts') return p.post_type === 'alert'
    return true 
  })

  const getBadgeColor = (type: string) => {
    switch(type) {
        case 'alert': return 'bg-red-100 text-red-700 border-red-200';
        case 'question': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-green-100 text-green-700 border-green-200';
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans pb-20 relative">
      
      {/* Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Flag size={20} className="text-red-500" /> Report Post
                        </h3>
                        <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Why are you reporting this post?</p>
                    <div className="space-y-2 mb-6">
                        {['Spam or Misleading', 'Harassment or Hate Speech', 'Violent or Graphic Content', 'Other'].map((reason) => (
                            <label key={reason} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input 
                                    type="radio" 
                                    name="reportReason" 
                                    value={reason} 
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{reason}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setReportModalOpen(false)} className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        <button onClick={submitReport} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm">Submit Report</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar for Mobile */}
      <div className="md:hidden bg-white p-4 shadow-sm sticky top-0 z-20 flex items-center gap-2 border-b border-gray-100">
        <button onClick={() => router.back()}><ArrowLeft size={20}/></button>
        <h1 className="font-semibold text-lg">Community Feed</h1>
      </div>

      <div className="max-w-7xl mx-auto md:py-6 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* --- LEFT SIDEBAR (Desktop Only) --- */}
        <div className="hidden md:block col-span-3 space-y-6">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-4 transition font-medium">
             <ArrowLeft size={18} /> Back to Dashboard
           </button>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <NavItem icon={<Users size={20}/>} label="Community Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
            <NavItem icon={<MessageSquare size={20}/>} label="Questions Only" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} />
            <NavItem icon={<AlertTriangle size={20}/>} label="Local Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600"/> Trending Locally
            </h3>
            <div className="space-y-4">
              <TrendItem tag="#BirdFluCheck" count="High Priority" isAlert />
              <TrendItem tag="#MaizePrices" count="Rising" />
              <TrendItem tag="#VaccineCamp" count="Tomorrow" />
            </div>
          </div>
        </div>

        {/* --- CENTER FEED --- */}
        <div className="col-span-12 md:col-span-6 space-y-6 p-4 md:p-0">
          
          {/* Create Post Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Create a new post</h3>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0 shadow-sm border border-green-200">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={user ? "Share an update, ask a question..." : "Please log in to post"}
                disabled={!user}
                className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none border border-gray-200 transition-all"
                rows={3}
              />
            </div>
            
            {/* Post Type Selectors */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button 
                    onClick={() => setPostType('update')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'update' ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                >
                    📢 Update
                </button>
                <button 
                    onClick={() => setPostType('question')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'question' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                >
                    ❓ Question
                </button>
                <button 
                    onClick={() => setPostType('alert')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'alert' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}
                >
                    🚨 Alert
                </button>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                 <MapPin size={14} className={location ? "text-green-500" : "text-gray-400"} /> 
                 {location ? "Posting from current location" : "Location required (or post globally)"}
              </div>
              <button 
                onClick={handlePost}
                disabled={!newPost || !user}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md"
              >
                Post <Send size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 sticky top-16 z-10">
            <button onClick={() => setActiveTab('feed')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'feed' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500'}`}>All</button>
            <button onClick={() => setActiveTab('questions')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'questions' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500'}`}>Questions</button>
            <button onClick={() => setActiveTab('alerts')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'alerts' ? 'bg-red-50 text-red-700 border-b-2 border-red-600' : 'text-gray-500'}`}>Alerts</button>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {loading && (
                <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Finding farmers near you...</p>
                </div>
            )}

            {!loading && displayPosts.length === 0 && (
                 <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No posts in your area yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to say hello!</p>
                 </div>
            )}
            
            <AnimatePresence>
            {displayPosts.map((post) => {
              const likesCount = post.likes ? post.likes.length : 0
              const isLiked = user ? (post.likes || []).includes(user.id) : false
              
              // Handle Profile Data Safe Access
              let authorName = "FarmSeva User"
              if (post.profiles) {
                if (Array.isArray(post.profiles) && post.profiles.length > 0) {
                  authorName = post.profiles[0].fullname
                } else if (!Array.isArray(post.profiles) && (post.profiles as Profile).fullname) {
                  authorName = (post.profiles as Profile).fullname
                }
              }
              if (authorName === "FarmSeva User" && post.author_name) {
                authorName = post.author_name
              }

              const avatarLetter = authorName.charAt(0).toUpperCase()

              return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={post.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-100 transition overflow-visible relative"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center font-bold text-green-700 text-sm border border-green-200 shadow-sm">
                        {avatarLetter}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {authorName}
                          {post.profiles && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-normal">Verified</span>}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getBadgeColor(post.post_type)}`}>
                        {post.post_type}
                        </span>
                        
                        {/* More Menu (Report) */}
                        <div className="relative">
                            <button 
                                onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {menuOpenId === post.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                    <button 
                                        onClick={() => openReportModal(post.id)}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Flag size={14} /> Report
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-gray-500 text-sm">
                      <button 
                        onClick={() => handleLike(post.id, post.likes)}
                        className={`flex items-center gap-2 transition px-2 py-1 rounded hover:bg-gray-50 ${isLiked ? 'text-red-500 font-medium' : 'hover:text-red-500'}`}
                      >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
                        <span>{likesCount > 0 ? likesCount : 'Like'}</span>
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 transition px-2 py-1 rounded hover:bg-gray-50 ${activeCommentId === post.id ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-500'}`}
                      >
                        <MessageSquare size={18}/> 
                        <span>Comment</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 hover:text-green-600 transition hover:bg-green-50 px-2 py-1 rounded"
                      >
                        <Share2 size={18}/> 
                        <span className="hidden sm:inline">Share</span>
                      </button>
                  </div>
                </div>

                {/* Comment Section */}
                <AnimatePresence>
                  {activeCommentId === post.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 border-t border-gray-100 p-4"
                    >
                      <div className="space-y-4 mb-4">
                        {loadingComments ? (
                          <p className="text-xs text-center text-gray-400">Loading comments...</p>
                        ) : (comments[post.id] || []).length === 0 ? (
                          <p className="text-xs text-center text-gray-400">No comments yet. Be the first!</p>
                        ) : (
                          (comments[post.id] || []).map(comment => {
                            let commentAuthor = "User"
                            const p = comment.profiles as any
                            if (p) {
                                if (Array.isArray(p)) commentAuthor = p[0]?.fullname || "User"
                                else commentAuthor = p.fullname || "User"
                            }

                            return (
                            <div key={comment.id} className="flex gap-3 text-sm">
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200 shrink-0">
                                {commentAuthor.charAt(0).toUpperCase()}
                              </div>
                              <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-gray-200 flex-1">
                                <p className="text-xs font-bold text-gray-900 mb-1">
                                  {commentAuthor}
                                </p>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          )})
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..." 
                          className="flex-1 text-sm p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                          onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                        />
                        <button 
                          onClick={() => submitComment(post.id)}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT WIDGETS (Desktop Only) --- */}
        <div className="hidden md:block col-span-3 space-y-6">
           <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 sticky top-4 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold">
               <Stethoscope size={20} /> Need Expert Help?
             </div>
             <p className="text-sm text-blue-600 mb-4 leading-relaxed">
               Something wrong with your livestock? Ask a specific question to our veterinary panel.
             </p>
             <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm shadow-sm transition">
               Ask an Expert
             </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// Subcomponents
const NavItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${active ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
    {icon} <span className="font-medium text-sm">{label}</span>
  </div>
)
const TrendItem = ({ tag, count, isAlert }: any) => (
  <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
    <div>
        <p className={`font-bold text-sm ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>{tag}</p>
        <p className="text-xs text-gray-400">{count}</p>
    </div>
    {isAlert && <AlertTriangle size={14} className="text-red-500" />}
  </div>
)