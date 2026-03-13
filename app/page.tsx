import Link from 'next/link';
import {
  Database,
  Code2,
  Brain,
  BarChart3,
  Rocket,
  BookOpen,
  Zap,
  Server,
  Users,
  CheckCircle2,
  ChevronRight,
  Terminal,
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Interactive SQL Editor',
    description: 'Write and execute real SQL queries in your browser with instant feedback.',
    color: 'text-blue-400',
  },
  {
    icon: Brain,
    title: 'AI-Powered Tutor',
    description: 'Get personalized help, explanations, and hints from an intelligent SQL tutor.',
    color: 'text-purple-400',
  },
  {
    icon: Database,
    title: 'Real Databases',
    description: 'Practice on realistic databases with employees, orders, students, and more.',
    color: 'text-green-400',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Track your progress, earn XP, and build streaks as you learn.',
    color: 'text-orange-400',
  },
  {
    icon: BookOpen,
    title: '40+ Lessons',
    description: 'From SELECT basics to advanced window functions and stored procedures.',
    color: 'text-pink-400',
  },
  {
    icon: Server,
    title: 'SQL Server Focus',
    description: 'Learn the SQL skills that matter for real jobs and enterprise applications.',
    color: 'text-teal-400',
  },
];

const curriculum = [
  { name: 'Getting Started', lessons: 5, color: 'bg-blue-500' },
  { name: 'Data Analysis Basics', lessons: 5, color: 'bg-green-500' },
  { name: 'Joining Tables', lessons: 5, color: 'bg-purple-500' },
  { name: 'Subqueries & CTEs', lessons: 4, color: 'bg-orange-500' },
  { name: 'Modifying Data', lessons: 4, color: 'bg-red-500' },
  { name: 'Functions & Expressions', lessons: 5, color: 'bg-teal-500' },
  { name: 'Window Functions', lessons: 5, color: 'bg-pink-500' },
  { name: 'Database Objects', lessons: 5, color: 'bg-indigo-500' },
  { name: 'SQL Server Advanced', lessons: 4, color: 'bg-yellow-500' },
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
          <Link
            href="/learn"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start Learning
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/30 border border-indigo-700/50 rounded-full text-indigo-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>Interactive SQL Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master SQL From
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {' '}Zero to Pro
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Learn SQL the right way with hands-on practice, real databases, and AI-powered guidance.
            From your first SELECT to advanced window functions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/learn"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Start Learning Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/playground"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
            >
              Try SQL Playground
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              <span>Browser-based</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Learn SQL
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete learning experience with interactive tools, AI assistance, and real-world practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comprehensive Curriculum
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              9 modules covering everything from basic queries to advanced SQL Server features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {curriculum.map((module, idx) => (
              <div
                key={module.name}
                className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg"
              >
                <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-medium text-white">{module.name}</h3>
                  <p className="text-sm text-slate-500">{module.lessons} lessons</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 mt-8">
            42 total lessons across 9 modules
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400">
              A simple three-step process to SQL mastery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-900/50 border border-indigo-700/50 rounded-xl flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-indigo-400 text-sm font-medium mb-2">Step {idx + 1}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master SQL?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start your journey today. No signup required, completely free.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl transition-all"
          >
            Start Learning Now
            <ChevronRight className="w-6 h-6" />
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
