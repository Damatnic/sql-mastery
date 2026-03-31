import Link from 'next/link';
import {
  Database,
  Code2,
  Brain,
  BarChart3,
  Rocket,
  BookOpen,
  Server,
  Users,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Sparkles,
  Play,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Interactive SQL Editor',
    description: 'Write and execute real SQL queries in your browser with instant feedback. No setup required.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Brain,
    title: 'AI-Powered Tutor',
    description: 'Get personalized help, explanations, and hints from an intelligent SQL tutor when you get stuck.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Database,
    title: 'Real Databases',
    description: 'Practice on realistic databases with employees, orders, students, and more. Just like production.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Track your progress, earn XP, and build streaks as you master SQL concepts.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: BookOpen,
    title: '42 Lessons',
    description: 'From SELECT basics to advanced window functions, CTEs, and database design.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    icon: Server,
    title: 'Job-Ready Skills',
    description: 'Learn the SQL skills that matter for real jobs and enterprise applications.',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
  },
];

const curriculum = [
  { name: 'Getting Started', lessons: 5, color: 'bg-blue-500', desc: 'SELECT, WHERE, ORDER BY' },
  { name: 'Data Analysis', lessons: 5, color: 'bg-green-500', desc: 'Aggregates, GROUP BY, HAVING' },
  { name: 'Joining Tables', lessons: 5, color: 'bg-purple-500', desc: 'INNER, LEFT, Self-joins' },
  { name: 'Subqueries & CTEs', lessons: 4, color: 'bg-orange-500', desc: 'Nested queries, WITH clause' },
  { name: 'Modifying Data', lessons: 4, color: 'bg-red-500', desc: 'INSERT, UPDATE, DELETE' },
  { name: 'Functions', lessons: 5, color: 'bg-teal-500', desc: 'String, Date, Math functions' },
  { name: 'Window Functions', lessons: 5, color: 'bg-pink-500', desc: 'RANK, LAG, Running totals' },
  { name: 'Database Objects', lessons: 5, color: 'bg-indigo-500', desc: 'Views, Indexes, Constraints' },
  { name: 'Advanced SQL', lessons: 4, color: 'bg-amber-500', desc: 'Transactions, Optimization' },
];

const steps = [
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Read concise theory with clear examples and explanations.',
  },
  {
    icon: Terminal,
    title: 'Practice',
    description: 'Write SQL queries in our interactive editor with instant feedback.',
  },
  {
    icon: Rocket,
    title: 'Master',
    description: 'Complete challenges, track progress, and build real SQL skills.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-500" />
            <span className="font-bold text-white text-xl">SQL Mastery</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/learn"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Lessons
            </Link>
            <Link
              href="/projects"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/playground"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Playground
            </Link>
            <Link
              href="/learn"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start Learning
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-full text-indigo-400 text-sm mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Interactive SQL Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Master SQL From
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              {' '}Zero to Pro
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Learn SQL the right way with hands-on practice, real databases, and AI-powered guidance.
            From your first SELECT to advanced window functions and beyond.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/learn"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start Learning Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/playground"
              className="group w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Try SQL Playground
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-purple-400" />
              </div>
              <span>Browser-based</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <span>42 Lessons</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Learn SQL
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              A complete learning experience with interactive tools, AI assistance, and real-world practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group p-6 ${feature.bgColor} border ${feature.borderColor} rounded-xl hover:border-opacity-50 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Curriculum
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              9 modules covering everything from basic queries to advanced SQL mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {curriculum.map((module, idx) => (
              <div
                key={module.name}
                className="group flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-105 transition-transform`}>
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{module.name}</h3>
                  <p className="text-xs text-slate-500 mb-1">{module.lessons} lessons</p>
                  <p className="text-xs text-slate-400">{module.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              View full curriculum
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg">
              A simple three-step process to SQL mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-700 to-transparent" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-900/50 border border-indigo-700/50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <step.icon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold md:hidden">
                    {idx + 1}
                  </div>
                </div>
                <div className="text-indigo-400 text-sm font-medium mb-2">Step {idx + 1}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-full text-emerald-400 text-sm mb-6">
            <Rocket className="w-4 h-4" />
            <span>Start your SQL journey today</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Master SQL?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands learning SQL the right way. No signup required, completely free.
          </p>
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            Start Learning Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-white">SQL Mastery</span>
          </div>
          <p className="text-slate-500 text-sm">
            Learn SQL from zero to pro
          </p>
        </div>
      </footer>
    </div>
  );
}
