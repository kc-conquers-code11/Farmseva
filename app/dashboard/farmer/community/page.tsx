'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Send, Search, 
  MessageSquare, Heart, Share2, 
  Users, Stethoscope, TrendingUp, AlertTriangle,
  ArrowLeft, MoreHorizontal, X, Flag, Image as ImageIcon, Loader2,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { Navbar } from '@/app/components/Navbar' // Ensure Navbar is imported
import { Footer } from '@/app/components/Footer'

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
        // Only show new post if it hasn't been reported by this user
        if (!reportedPostIds.includes(newPost.id)) { 
             setPosts((prev) => [newPost, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reportedPostIds])

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
      setPosts(data as Post[])
      
    } catch (err) {
      // Fallback query if profiles join fails or other error
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

  // -- 5. SUBMIT POST --
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
      author_name: user.user_metadata?.fullname || "FarmSeva User" 
    })

    setIsUploading(false)

    if (!error) {
      setNewPost('')
      clearImage()
      // Refresh feed to show own post immediately if realtime lag occurs
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
        // Fallback
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
        alert("Your comment was blocked.")
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
    setReportedPostIds(prev => [...prev, postIdToHide])

    setReportModalOpen(false)
    setReportReason('')
    setReportingPostId(null)

    setTimeout(() => {
        alert("Thanks for reporting. This post has been hidden from your view.")
    }, 500)
  }

  // -- RENDER HELPERS --
  const displayPosts = posts
    .filter(p => {
        if (activeTab === 'questions') return p.post_type === 'question'
        if (activeTab === 'alerts') return p.post_type === 'alert'
        return true 
    })
    .filter(p => !reportedPostIds.includes(p.id))

  const getBadgeStyles = (type: string) => {
    switch(type) {
        case 'alert': return 'bg-red-100 text-red-700 border-red-200';
        case 'question': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />
      
      {/* Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-neutral-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <div className="p-2 bg-red-50 rounded-lg text-red-500"><Flag size={20} /></div> Report Content
                        </h3>
                        <button onClick={() => setReportModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded-full transition">
                            <X size={20} className="text-neutral-400" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 mb-4 font-medium">Please select a reason for reporting this post:</p>
                    <div className="space-y-2.5 mb-8">
                        {['Spam or Misleading', 'Harassment or Hate Speech', 'Violent or Graphic Content', 'Other'].map((reason) => (
                            <label key={reason} className="flex items-center gap-3 p-3.5 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 hover:border-neutral-300 transition-all group">
                                <input 
                                    type="radio" 
                                    name="reportReason" 
                                    value={reason} 
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">{reason}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setReportModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition">Cancel</button>
                        <button onClick={submitReport} disabled={!reportReason} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none">Submit Report</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-32 px-4 md:px-8 gap-8">
        
        {/* === LEFT SIDEBAR (Navigation) === */}
        <div className="hidden md:block w-72 shrink-0 sticky top-24 self-start">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 font-medium transition-colors group">
             <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:border-neutral-300">
                <ArrowLeft size={16} />
             </div>
             Back to Dashboard
           </button>

           <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-6">
             <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                <h3 className="font-bold text-neutral-800 text-sm uppercase tracking-wider">Feed Filters</h3>
             </div>
             <div className="p-2 space-y-1">
               <NavItem icon={<Users size={20}/>} label="Community Feed" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
               <NavItem icon={<MessageSquare size={20}/>} label="Questions Only" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} />
               <NavItem icon={<AlertTriangle size={20}/>} label="Local Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
             </div>
           </div>

           <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white shadow-xl shadow-neutral-900/10">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                 <TrendingUp size={20} className="text-emerald-400"/>
               </div>
               <h3 className="font-bold">Trending Now</h3>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-white/10">
                 <div>
                   <p className="font-bold text-sm">#BirdFluCheck</p>
                   <p className="text-xs text-neutral-400 mt-0.5">1.2k posts</p>
                 </div>
                 <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded">HOT</span>
               </div>
               <div className="flex justify-between items-center">
                 <div>
                   <p className="font-bold text-sm">#MaizePrices</p>
                   <p className="text-xs text-neutral-400 mt-0.5">850 posts</p>
                 </div>
                 <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">UP</span>
               </div>
             </div>
           </div>
        </div>

        {/* === CENTER FEED === */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          
          {/* Create Post Widget */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 mb-8 transition-shadow hover:shadow-md">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shrink-0 text-lg border-2 border-white shadow-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={user ? "What's happening on your farm?" : "Login to share updates..."}
                  disabled={!user || isUploading}
                  className="w-full bg-neutral-50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white resize-none border border-transparent focus:border-emerald-200 transition-all placeholder:text-neutral-400 min-h-[100px]"
                />
                
                {/* Image Preview */}
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mt-3 rounded-xl overflow-hidden border border-neutral-200">
                      <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                      <button 
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/80 transition"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                   <div className="flex items-center gap-2">
                      <button onClick={() => setPostType('update')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${postType === 'update' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}>Update</button>
                      <button onClick={() => setPostType('question')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${postType === 'question' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}>Question</button>
                      <button onClick={() => setPostType('alert')} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${postType === 'alert' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'}`}>Alert</button>
                   </div>

                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!user || isUploading}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-emerald-600 bg-neutral-50 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <ImageIcon size={16} /> Photo
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />

                      <button 
                        onClick={handlePost}
                        disabled={(!newPost.trim() && !selectedImage) || !user || isUploading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                        {isUploading ? "Posting..." : "Post"}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                    <p className="text-sm text-neutral-400 font-medium">Fetching updates...</p>
                </div>
            )}
            
            <AnimatePresence>
            {displayPosts.map((post, idx) => {
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
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={post.id} 
                className="bg-white rounded-2xl shadow-sm border border-neutral-200 hover:border-emerald-200 hover:shadow-md transition-all overflow-visible relative group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center font-bold text-emerald-800 text-sm shadow-inner">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                          {authorName}
                          {post.profiles && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold border border-blue-100">PRO</span>}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-neutral-400 font-medium">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                            {post.latitude !== 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">
                                    <MapPin size={10} /> nearby
                                </span>
                            )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border ${getBadgeStyles(post.post_type)}`}>
                        {post.post_type}
                        </span>
                        
                        {/* More Menu */}
                        <div className="relative">
                            <button 
                                onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {menuOpenId === post.id && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-neutral-100 py-1.5 z-10 overflow-hidden">
                                    <button 
                                        onClick={() => openReportModal(post.id)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                    >
                                        <Flag size={16} /> Report
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-neutral-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mb-5 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50">
                      <img src={post.image_url} alt="Post image" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div className="flex gap-1">
                        <button onClick={() => handleLike(post.id, post.likes)} className={`flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors ${isLiked ? 'text-red-500' : 'text-neutral-500'}`}>
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} /> 
                            <span className="text-xs font-bold">{likesCount || 'Like'}</span>
                        </button>
                        <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors text-neutral-500 hover:text-blue-600">
                            <MessageSquare size={20}/> <span className="text-xs font-bold">Comment</span>
                        </button>
                      </div>
                      <button onClick={() => handleShare(post)} className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-xl transition-colors text-neutral-400 hover:text-neutral-600">
                        <Share2 size={18}/> 
                      </button>
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {activeCommentId === post.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-neutral-50 border-t border-neutral-100 overflow-hidden">
                      <div className="p-5">
                        <div className="space-y-4 mb-5">
                          {loadingComments && <div className="flex justify-center"><Loader2 size={20} className="animate-spin text-neutral-400"/></div>}
                          {(comments[post.id] || []).map(comment => {
                             let cAuth = "User"
                             if (comment.profiles) cAuth = (comment.profiles as Profile).fullname || "User"
                             return (
                              <div key={comment.id} className="flex gap-3 text-sm group/comment">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border border-neutral-200 text-neutral-600 shrink-0 shadow-sm">{cAuth[0]}</div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-neutral-200 shadow-sm flex-1">
                                  <p className="text-xs font-bold text-neutral-900 mb-1">{cAuth}</p>
                                  <p className="text-neutral-600 leading-relaxed">{comment.content}</p> 
                                </div>
                              </div>
                             )
                          })}
                          {(comments[post.id] || []).length === 0 && !loadingComments && (
                              <p className="text-xs text-center text-neutral-400 py-2">No comments yet. Be the first!</p>
                          )}
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder="Write a comment..." 
                            className="flex-1 text-sm px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-sm transition-all"
                            disabled={!user}
                            onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                          />
                          <button onClick={() => submitComment(post.id)} className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg shadow-emerald-200" disabled={!user}>
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )})}
            </AnimatePresence>
          </div>
        </div>
        
        {/* === RIGHT SIDEBAR (Widgets) === */}
        <div className="hidden md:block w-72 shrink-0 sticky top-24 self-start space-y-6">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                 <Stethoscope size={20} />
               </div>
               <h3 className="font-bold text-neutral-800">Expert Help</h3>
             </div>
             <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
               Something wrong with your livestock? Get quick advice from our verified veterinary panel.
             </p>
             <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-200 hover:translate-y-[-2px]">
               Ask an Expert
             </button>
           </div>

           <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50">
              <h4 className="font-bold text-emerald-800 text-sm mb-2">Community Guidelines</h4>
              <ul className="text-xs text-emerald-700 space-y-2 list-disc pl-4">
                  <li>Be respectful to other farmers.</li>
                  <li>Verify information before sharing alerts.</li>
                  <li>No spam or unrelated advertisements.</li>
              </ul>
           </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}

// Helper Component for Sidebar Nav Items
const NavItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all font-medium text-sm ${active ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}>
    {icon} <span>{label}</span>
  </div>
)