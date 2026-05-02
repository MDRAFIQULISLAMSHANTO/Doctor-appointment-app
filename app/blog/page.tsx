import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const posts = [
  { title: "Understanding Arthritis: Types, Symptoms & Modern Treatment", category: "Arthritis", date: "April 28, 2025", readTime: "5 min", excerpt: "Arthritis affects millions worldwide. Learn about different types of arthritis and the latest evidence-based treatment approaches available at our clinic.", emoji: "🦴" },
  { title: "Stroke Rehabilitation: What to Expect in Recovery", category: "Rehabilitation", date: "April 15, 2025", readTime: "7 min", excerpt: "Recovery after stroke requires a comprehensive rehabilitation plan. Here's what patients and families should know about the recovery journey and realistic timelines.", emoji: "🧠" },
  { title: "Managing Chronic Back Pain Without Surgery", category: "Pain Management", date: "March 30, 2025", readTime: "4 min", excerpt: "Most chronic back pain cases can be successfully managed without surgery through targeted physical therapy and interventional approaches.", emoji: "💊" },
  { title: "The Role of Exercise in Arthritis Management", category: "Arthritis", date: "March 20, 2025", readTime: "6 min", excerpt: "Contrary to common belief, appropriate exercise is one of the most effective treatments for arthritis. Learn which exercises help and which to avoid.", emoji: "🏃" },
  { title: "Cervical Spondylosis: Causes, Symptoms, and Treatment", category: "Pain Management", date: "March 10, 2025", readTime: "5 min", excerpt: "Neck pain and stiffness from cervical spondylosis is a common condition. Understand the causes and discover effective treatment options.", emoji: "🦴" },
  { title: "Benefits of Physical Therapy After Joint Replacement", category: "Rehabilitation", date: "February 28, 2025", readTime: "4 min", excerpt: "Post-surgical physical therapy is crucial for successful recovery after knee or hip replacement. Learn what to expect from your rehabilitation program.", emoji: "⚕️" },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 bg-[#F4F4F5] min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
              Health Blog
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-2">Latest Health News & Expert Advice</h1>
            <p className="text-[#A3A3A3]">Insights from Dr. Jahangir on physical medicine and rehabilitation</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Featured post */}
          <div className="bg-[#14967F] rounded-3xl p-8 mb-8 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-block bg-[#FAD069] text-[#191919] rounded-full px-4 py-1 text-xs font-semibold mb-4">
                Featured
              </span>
              <h2 className="text-2xl font-bold text-white mb-3">{posts[0].title}</h2>
              <p className="text-white/70 leading-relaxed mb-4">{posts[0].excerpt}</p>
              <div className="flex items-center gap-4">
                <span className="text-white/50 text-sm">{posts[0].date}</span>
                <span className="text-white/50 text-sm">•</span>
                <span className="text-white/50 text-sm">{posts[0].readTime} read</span>
              </div>
            </div>
            <div className="h-40 bg-white/10 rounded-2xl flex items-center justify-center text-6xl">
              {posts[0].emoji}
            </div>
          </div>

          {/* Posts grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post, i) => (
              <Link key={i} href="#" className="group">
                <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-[#e8f5f2] to-[#d0ede8] flex items-center justify-center">
                    <span className="text-5xl">{post.emoji}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-[#e8f5f2] text-[#14967F] rounded-full px-3 py-0.5 text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-[#A3A3A3] text-xs">{post.readTime} read</span>
                    </div>
                    <h3 className="font-semibold text-[#191919] mb-2 leading-snug group-hover:text-[#14967F] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed flex-1">{post.excerpt}</p>
                    <p className="text-[#A3A3A3] text-xs mt-3">{post.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
