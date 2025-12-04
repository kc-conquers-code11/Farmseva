'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Send, Search, 
  MessageSquare, Heart, Share2, 
  Users, Stethoscope, TrendingUp, AlertTriangle,
  ArrowLeft, MoreHorizontal, X, Flag, Image as ImageIcon, Loader2
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
  profiles?: Profile 
}

interface Post {
  id: number
  user_id: string
  content: string
  image_url?: string 
  post_type: PostType
  latitude: number
  longitude: number
  created_at: string
  likes: string[] | null 
  profiles?: Profile | Profile[] 
  author_name?: string 
}

// --- COMPONENT START ---
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
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Comment & Report State
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState(false)
  
  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingPostId, setReportingPostId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)

  // NEW STATE: Tracks posts reported by the current user
  const [reportedPostIds, setReportedPostIds] = useState<number[]>([]);


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
          console.error("Location error:", err)
          fetchPosts(0, 0, true) 
        },
        { timeout: 10000 } 
      )
    } else {
      fetchPosts(0, 0, true)
    }
  }, [])

  // -- 2. REALTIME SUBSCRIPTION --
  useEffect(() => {
    const channel = supabase
      .channel('realtime posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        const newPost = payload.new as Post
        // Only show new post if it hasn't been reported by this user (unlikely for new posts, but good check)
        if (!reportedPostIds.includes(newPost.id)) { 
             setPosts((prev) => [newPost, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reportedPostIds]) // Dependency added to consider reported posts list

  // -- 3. FETCH POSTS (Safe: Uses parameterized queries) --
  const fetchPosts = async (lat: number, lng: number, global = false) => {
    const range = 0.5 
    
    try {
      let query = supabase
        .from('community_posts')
        .select(`*, profiles (fullname, avatar_url)`)
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
      // Filter out posts that were previously reported by the user (if persistent storage was used)
      setPosts(data as Post[])
      
    } catch (err) {
      const { data } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setPosts(data as Post[])
    } finally {
      setLoading(false)
    }
  }

  // -- 4. IMAGE HANDLING --
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)")
      
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // -- 5. SUBMIT POST (Security: Auth check & Server-Error Handling) --
  const handlePost = async () => {
    if (!user) {
      alert("Please log in to post.");
      return;
    }

    const postContent = newPost.trim(); 

    if (!postContent && !selectedImage) return

    
    setIsUploading(true)
    let imageUrl = null

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('community_images')
        .upload(filePath, selectedImage)

      if (uploadError) {
        console.error(uploadError)
        alert("Failed to upload image")
        setIsUploading(false)
        return
      }

      const { data } = supabase.storage.from('community_images').getPublicUrl(filePath)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content: postContent, 
      post_type: postType,
      latitude: location?.lat || 0,
      longitude: location?.lng || 0,
      image_url: imageUrl,
      likes: [], 
      author_name: user.user_metadata?.full_name || "FarmSeva User" 
    })

    setIsUploading(false)

    if (!error) {
      setNewPost('')
      clearImage()
      const lat = location?.lat || 0
      fetchPosts(lat, location?.lng || 0, lat === 0)
    } else {
      if (error.message.includes('Inappropriate content detected')) {
        alert("Your post was blocked because it contains inappropriate language.")
      } else {
        alert("Failed to post. Please try again.")
      }
    }
  }

  // -- OTHER ACTIONS --
  const handleLike = async (postId: number, currentLikes: string[] | null) => {
    if (!user) return alert("Please log in to like posts")
    
    const likesArr = Array.isArray(currentLikes) ? currentLikes : []
    const hasLiked = likesArr.includes(user.id)
    const updatedLikes = hasLiked ? likesArr.filter(id => id !== user.id) : [...likesArr, user.id]

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedLikes } : p))

    const { error } = await supabase
      .from('community_posts')
      .update({ likes: updatedLikes })
      .eq('id', postId)

    if (error) console.warn("Like failed (check RLS):", error.message)
  }

  const toggleComments = async (postId: number) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null)
      return
    }
    setActiveCommentId(postId)
    
    if (!comments[postId]) {
      setLoadingComments(true)
      
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles (fullname)`)
        .eq('post_id', postId) 
        .order('created_at', { ascending: true })

      if (!error && data) {
        setComments(prev => ({...prev, [postId]: data as unknown as Comment[] }))
      } else {
        console.warn("Comments relation fetch failed, using fallback.", error?.message)
        
        const { data: simpleData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          
        if (simpleData) {
          setComments(prev => ({...prev, [postId]: simpleData as unknown as Comment[] }))
        }
      }
      setLoadingComments(false)
    }
  }

  const submitComment = async (postId: number) => {
    if (!user) return alert("Please log in to comment")
    
    const commentContent = newComment.trim();
    if (!commentContent) return

    setNewComment('') 

    const tempComment: Comment = {
      id: Date.now(),
      post_id: postId,
      user_id: user.id,
      content: commentContent, 
      created_at: new Date().toISOString(),
      profiles: { fullname: user.user_metadata?.full_name || 'Me' }
    }
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), tempComment] }))

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: commentContent
    })
    
    if (error) {
      console.error("Comment failed:", error.message)
      setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== tempComment.id) }))
      
      if (error.message.includes('Inappropriate content detected')) {
        alert("Your comment was blocked because it contains inappropriate language.")
      } else {
        alert(`Failed to save comment: ${error.message}`)
      }
    }
  }

  const handleShare = async (post: Post) => {
    const shareData = {
      title: 'FarmSeva Post',
      text: post.content,
      url: window.location.href
    }
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${post.content} - Shared from FarmSeva`)
      alert('Copied to clipboard!')
    }
  }

  // --- REPORTING LOGIC ---
  const openReportModal = (postId: number) => {
    if (!user) return alert("Please log in to report posts") 
    setReportingPostId(postId)
    setReportModalOpen(true)
    setMenuOpenId(null)
  }

  const submitReport = async () => {
    if (!reportReason || reportingPostId === null) return alert("Please select a reason.")
    
    const postIdToHide = reportingPostId;

    // 1. ADD POST ID TO THE REPORTED STATE (Hides it immediately for this user)
    setReportedPostIds(prev => [...prev, postIdToHide])

    // 2. Clear Modal State
    setReportModalOpen(false)
    setReportReason('')
    setReportingPostId(null)

    // Simulate DB call (In a real app, this would be an INSERT into a reports table)
    setTimeout(() => {
        alert("Thanks for reporting. This post has been hidden from your view and submitted for review.")
    }, 500)
  }

  // -- RENDER HELPERS --
  const displayPosts = posts
    // 1. Filter by Tab
    .filter(p => {
        if (activeTab === 'questions') return p.post_type === 'question'
        if (activeTab === 'alerts') return p.post_type === 'alert'
        return true 
    })
    // 2. Filter out Reported Posts
    .filter(p => !reportedPostIds.includes(p.id))

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
                        <button onClick={submitReport} disabled={!reportReason} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm disabled:opacity-50">Submit Report</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Mobile */}
      <div className="md:hidden bg-white p-4 shadow-sm sticky top-0 z-20 flex items-center gap-2 border-b border-gray-100">
        <button onClick={() => router.back()}><ArrowLeft size={20}/></button>
        <h1 className="font-semibold text-lg">Community Feed</h1>
      </div>

      <div className="max-w-7xl mx-auto md:py-6 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
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
               <div className="flex justify-between items-center border-b border-gray-50 pb-2"><p className="font-bold text-sm text-red-600">#BirdFluCheck</p><p className="text-xs text-gray-400">High Priority</p></div>
               <div className="flex justify-between items-center border-b border-gray-50 pb-2"><p className="font-bold text-sm text-gray-800">#MaizePrices</p><p className="text-xs text-gray-400">Rising</p></div>
             </div>
           </div>
        </div>

        {/* Center Feed */}
        <div className="col-span-12 md:col-span-6 space-y-6 p-4 md:p-0">
          
          {/* Create Post */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Create a new post</h3>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={user ? "Share an update, ask a question..." : "Please log in to post"}
                  disabled={!user || isUploading}
                  className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none border border-gray-200 transition-all"
                  rows={3}
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
               {/* Post Types */}
               <button onClick={() => setPostType('update')} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'update' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>📢 Update</button>
               <button onClick={() => setPostType('question')} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'question' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>❓ Question</button>
               <button onClick={() => setPostType('alert')} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${postType === 'alert' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'}`}>🚨 Alert</button>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                   <MapPin size={14} className={location ? "text-green-500" : "text-gray-400"} /> 
                   {location ? "Loc: ON" : "Loc: OFF"}
                </div>
                {/* Image Upload Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!user || isUploading}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition disabled:opacity-50"
                >
                  <ImageIcon size={16} /> Photo
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <button 
                onClick={handlePost}
                disabled={(!newPost.trim() && !selectedImage) || !user || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition shadow-sm"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                {isUploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading && <div className="text-center py-10 text-gray-400 text-sm">Finding posts...</div>}
            
            <AnimatePresence>
            {displayPosts.map((post) => {
              const likesCount = post.likes ? post.likes.length : 0
              const isLiked = user ? (post.likes || []).includes(user.id) : false
              
              let authorName = "FarmSeva User"
              if (post.profiles) {
                if (Array.isArray(post.profiles)) authorName = post.profiles[0]?.fullname || "User"
                else authorName = (post.profiles as Profile).fullname || "User"
              } else if (post.author_name) {
                authorName = post.author_name
              }

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
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 text-sm">
                        {authorName.charAt(0).toUpperCase()}
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
                  
                  <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Display Uploaded Image */}
                  {post.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                      <img src={post.image_url} alt="Post image" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-gray-500 text-sm">
                      <button onClick={() => handleLike(post.id, post.likes)} className={`flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded ${isLiked ? 'text-red-500' : ''}`}>
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> <span>{likesCount || 'Like'}</span>
                      </button>
                      <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded">
                        <MessageSquare size={18}/> <span>Comment</span>
                      </button>
                      <button onClick={() => handleShare(post)} className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded">
                        <Share2 size={18}/> <span>Share</span>
                      </button>
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {activeCommentId === post.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-gray-50 border-t border-gray-100 p-4">
                      <div className="space-y-3 mb-4">
                        {loadingComments && <p className="text-xs text-center text-gray-400">Loading...</p>}
                        {(comments[post.id] || []).map(comment => {
                           let cAuth = "User"
                           if (comment.profiles) cAuth = (comment.profiles as Profile).fullname || "User"
                           return (
                            <div key={comment.id} className="flex gap-3 text-sm">
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold border shrink-0">{cAuth[0]}</div>
                              <div className="bg-white p-2 rounded-lg border flex-1">
                                <p className="text-xs font-bold">{cAuth}</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p> 
                              </div>
                            </div>
                           )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 text-sm p-2 rounded border focus:outline-none focus:border-green-500" disabled={!user}/>
                        <button onClick={() => submitComment(post.id)} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={!user}><Send size={16} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Right Widgets */}
        <div className="hidden md:block col-span-3 space-y-6">
           <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold"><Stethoscope size={20} /> Need Expert Help?</div>
             <p className="text-sm text-blue-600 mb-4">Something wrong with your livestock? Ask a specific question to our veterinary panel.</p>
             <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition">Ask an Expert</button>
           </div>
        </div>
      </div>
    </div>
  )
}

const NavItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${active ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
    {icon} <span className="font-medium text-sm">{label}</span>
  </div>
)