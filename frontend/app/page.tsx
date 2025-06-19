"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Target, BarChart3, Settings, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()

  const handleStartLearning = () => {
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b-4 border-black py-4 px-6 md:px-10 flex justify-between items-center bg-white">
        <div className="font-black text-2xl tracking-tighter">
          <span className="text-pink-600">tech</span>
          <span className="text-black">path</span>
        </div>
        <div className="hidden md:flex gap-6">
          <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
            Features
          </Link>
          <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
            Courses
          </Link>
          <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
            About
          </Link>
        </div>
        <Button
          className="bg-black text-white hover:bg-pink-600 font-bold rounded-xl px-6 py-2 transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-yellow-300 opacity-70 animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-pink-300 opacity-60 animate-float-delay"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-purple-300 opacity-60 animate-float-slow"></div>
          <div className="absolute -bottom-10 right-1/3 w-36 h-36 rounded-full bg-blue-200 opacity-50 animate-float-delay-slow"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-4 border-black p-8 md:p-12 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-y-[-5px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <div className="flex items-center mb-6">
                <Brain className="text-pink-600 mr-2 animate-pulse" size={32} />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                  One platform. <span className="text-pink-600">A million paths</span> into tech.
                </h1>
              </div>

              <p className="text-xl md:text-2xl mb-8 font-medium">
                Personalized, flexible, AI-powered learning — built for women ready to take control of how they learn.
              </p>

              <Link href="/signup">
                <Button
                  className="group bg-pink-600 hover:bg-black text-white text-lg font-bold py-4 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
                >
                  🚀 Start your learning path
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <p className="mt-4 text-sm font-medium italic">Learn your way. Grow faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center mb-16">
            <div className="h-1 w-10 bg-black mr-4"></div>
            <h2 className="text-3xl md:text-4xl font-black">
              <span className="text-pink-600">🔍 Features</span> — Clear, Sharp, Empowering
            </h2>
            <div className="h-1 w-10 bg-black ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Settings size={32} />
              </div>
              <h3 className="feature-title">🛠 Learn on your terms</h3>
              <p className="feature-description">
                Choose video, audio, or articles. Move at your pace. Pick what fits your life.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Brain size={32} />
              </div>
              <h3 className="feature-title">🧠 Built-in AI assistant</h3>
              <p className="feature-description">
                Ask questions anytime. Get smart, contextual help without getting stuck.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <Target size={32} />
              </div>
              <h3 className="feature-title">🎯 Adaptive learning paths</h3>
              <p className="feature-description">
                We tailor your path based on your goals, time, and progress — not someone else's syllabus.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card group">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="feature-title">📊 Progress that means something</h3>
              <p className="feature-description">Real projects. Real feedback. No fluff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Empowerment Block */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
              <span className="text-pink-400">🙋‍♀️ This is for you</span> if you've ever thought:
            </h2>

            <div className="space-y-6">
              <div className="empowerment-quote">"I don't learn well from hour-long videos."</div>

              <div className="empowerment-quote">"I want to code, but I don't know where to start."</div>

              <div className="empowerment-quote">"I have limited time — I need every lesson to count"</div>
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                className="group bg-pink-600 hover:bg-white hover:text-black text-white text-lg font-bold py-4 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,1)] hover:shadow-[6px_6px_0px_0px_rgba(219,39,119,1)] transition-all hover:translate-y-[-2px]"
                onClick={handleStartLearning}
              >
                <Sparkles className="mr-2" />
                Join thousands of women in tech
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black py-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="font-black text-2xl tracking-tighter mb-4 md:mb-0">
              <span className="text-pink-600">tech</span>
              <span className="text-black">path</span>
            </div>

            <div className="flex gap-6">
              <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
                Terms
              </Link>
              <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="font-bold hover:text-pink-600 transition-colors">
                Contact
              </Link>
            </div>

            <p className="mt-4 md:mt-0 text-sm">© 2025 techpath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
