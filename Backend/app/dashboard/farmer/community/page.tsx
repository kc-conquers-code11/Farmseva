'use client'

import { useState, useEffect } from 'react'
// FIXED: Removed the failing auth-helpers import
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs' 
// ADDED: Use your existing client that works in the dashboard
import { supabase } from '@/lib/supabaseClient'

import { motion } from 'framer-motion'
import { 
  MapPin, Image as ImageIcon, Send, Search, 
  MessageSquare, Heart, Share2, MoreHorizontal, 
  Users, Stethoscope, TrendingUp, AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

// --- Types ---
type PostType = 'update' | 'question' | 'alert'

interface Post {
  id: number
  user_id: string
  content: string
  post_type: PostType
  latitude: number
  longitude: number
  author_name: string
  created_at: string
}

export default function CommunityPage() {
  // REMOVED: const supabase = createClientComponentClient() 
  // We now use the imported 'supabase' object directly.
  
  const router = useRouter()
  
  // -- STATE --
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [postType, setPostType] = useState<PostType>('update')
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeTab, setActiveTab] = useState('feed') 

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
          alert("Please enable location access to see posts from nearby farmers.")
          setLoading(false)
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setLoading(false)
    }
  }, [])

  // -- 2. FETCH POSTS --
  const fetchPosts = async (lat: number, lng: number) => {
    const range = 0.5 
    
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .gte('latitude', lat - range)
      .lte('latitude', lat + range)
      .gte('longitude', lng - range)
      .lte('longitude', lng + range)
      .order('created_at', { ascending: false })

    if (error) console.error("Error fetching posts:", error)
    if (data) setPosts(data as Post[])
    setLoading(false)
  }

  // -- 3. HANDLE POST SUBMISSION --
  const handlePost = async () => {
    if (!newPost.trim() || !location) return
    
    // A. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("Please log in first")

    // B. Get Farmer Name from 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('fullname') 
      .eq('id', user.id)
      .single()

    const authorName = profile?.fullname || "FarmSeva User"

    // C. Insert Post
    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content: newPost,
      post_type: postType,
      latitude: location.lat,
      longitude: location.lng,
      author_name: authorName
    })

    if (!error) {
      setNewPost('')
      fetchPosts(location.lat, location.lng) // Refresh feed
    } else {
      console.error(error)
      alert("Failed to post update. Please try again.")
    }
  }

  // Filter logic for tabs
  const displayPosts = posts.filter(p => {
    if (activeTab === 'questions') return p.post_type === 'question'
    if (activeTab === 'alerts') return p.post_type === 'alert'
    return true 
  })

  // Helper for Post Badge Colors
  const getBadgeColor = (type: string) => {
    switch(type) {
        case 'alert': return 'bg-red-100 text-red-700 border-red-200';
        case 'question': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-green-100 text-green-700 border-green-200';
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans">
      {/* Top Bar for Mobile */}
      <div className="md:hidden bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-2">
        <button onClick={() => router.back()}><ArrowLeft size={20}/></button>
        <h1 className="font-semibold text-lg">Community Feed</h1>
      </div>

      <div className="max-w-7xl mx-auto md:py-6 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* --- LEFT SIDEBAR (Desktop Only) --- */}
        <div className="hidden md:block col-span-3 space-y-6">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-4 transition">
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
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold shrink-0">
                You
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update, ask a question, or report an issue..."
                className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 resize-none border border-gray-200"
                rows={3}
              />
            </div>
            
            {/* Post Type Selectors */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button 
                    onClick={() => setPostType('update')}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition ${postType === 'update' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    📢 Update
                </button>
                <button 
                    onClick={() => setPostType('question')}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition ${postType === 'question' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    ❓ Question
                </button>
                <button 
                    onClick={() => setPostType('alert')}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition ${postType === 'alert' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                    🚨 Alert
                </button>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                 <MapPin size={14} /> 
                 {location ? "Posting from your location" : "Locating..."}
              </div>
              <button 
                onClick={handlePost}
                disabled={!newPost || !location}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Post <Send size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <button onClick={() => setActiveTab('feed')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'feed' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500'}`}>All</button>
            <button onClick={() => setActiveTab('questions')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'questions' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500'}`}>Questions</button>
            <button onClick={() => setActiveTab('alerts')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'alerts' ? 'bg-red-50 text-red-700 border-b-2 border-red-600' : 'text-gray-500'}`}>Alerts</button>
          </div>

          {/* Feed */}
          <div className="space-y-4 pb-20 md:pb-0">
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
            
            {displayPosts.map((post) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={post.id} 
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-green-100 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center font-bold text-green-700 text-sm border border-green-200 shadow-sm">
                      {post.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{post.author_name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getBadgeColor(post.post_type)}`}>
                    {post.post_type}
                  </span>
                </div>
                
                <p className="text-gray-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-gray-400 text-sm">
                   <button className="flex items-center gap-2 hover:text-red-500 transition hover:bg-red-50 px-2 py-1 rounded"><Heart size={16}/> <span>Like</span></button>
                   <button className="flex items-center gap-2 hover:text-blue-500 transition hover:bg-blue-50 px-2 py-1 rounded"><MessageSquare size={16}/> <span>Comment</span></button>
                   <button className="flex items-center gap-2 hover:text-green-500 transition hover:bg-green-50 px-2 py-1 rounded"><Share2 size={16}/> <span>Share</span></button>
                </div>
              </motion.div>
            ))}
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