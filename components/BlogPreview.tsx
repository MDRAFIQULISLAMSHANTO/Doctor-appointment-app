import Link from "next/link";

const posts = [
  {
    title: "Understanding Arthritis: Types, Symptoms & Modern Treatment",
    category: "Arthritis",
    date: "April 28, 2025",
    excerpt: "Arthritis affects millions worldwide. Learn about different types of arthritis and the latest evidence-based treatment approaches.",
    readTime: "5 min read",
  },
  {
    title: "Stroke Rehabilitation: What to Expect in Recovery",
    category: "Rehabilitation",
    date: "April 15, 2025",
    excerpt: "Recovery after stroke requires a comprehensive rehabilitation plan. Here's what patients and families should know about the recovery journey.",
    readTime: "7 min read",
  },
  {
    title: "Managing Chronic Back Pain Without Surgery",
    category: "Pain Management",
    date: "March 30, 2025",
    excerpt: "Most chronic back pain cases can be successfully managed without surgery through targeted physical therapy and interventional approaches.",
    readTime: "4 min read",
  },
];

export default function BlogPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center border border-gray-300 rounded-full px-4 py-1.5 text-sm text-[#A3A3A3] mb-4">
              Health Blog
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919]">
              Latest Health News &amp; Expert Advice
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 border-2 border-[#14967F] text-[#14967F] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#14967F] hover:text-white transition-colors"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link key={i} href="/blog" className="group">
              <div className="bg-[#F4F4F5] rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-[#e8f5f2] to-[#d0ede8] flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl">
                      {["🦴", "🧠", "💊"][i]}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#e8f5f2] text-[#14967F] rounded-full px-3 py-1 text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-[#A3A3A3] text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="font-semibold text-[#191919] mb-2 leading-snug group-hover:text-[#14967F] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[#A3A3A3] text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <p className="text-[#A3A3A3] text-xs mt-3">{post.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#14967F] text-white rounded-full px-6 py-3 text-sm font-medium"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
