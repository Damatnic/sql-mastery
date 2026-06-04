"use client";

import Link from "next/link";

export default function StartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <span className="text-accent">$</span> cd ~
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">lessons</Link>
            <Link href="/playground" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">playground</Link>
            <Link href="/glossary" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">glossary</Link>
            <Link href="/next-steps" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">next steps</Link>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-semibold">Start here</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          This is a place to learn SQL by writing it against real databases, right in your browser, with
          nothing to install. If you have never queried a database before, that is fine. The first module
          assumes you know nothing and gets you reading data in about a minute.
        </p>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># the path</p>
          <ol className="mt-4 space-y-3 text-muted-foreground leading-relaxed">
            <li><span className="text-accent">01</span>  <span className="text-foreground">Start Here</span>: what a database is, your first SELECT, how to use this site.</li>
            <li><span className="text-accent">02</span>  <span className="text-foreground">Getting Started</span> and <span className="text-foreground">Data Analysis</span>: filtering, sorting, grouping, counting.</li>
            <li><span className="text-accent">03</span>  <span className="text-foreground">Joining Tables</span> and beyond: combining tables, subqueries, CTEs, window functions.</li>
            <li><span className="text-accent">04</span>  <span className="text-foreground">Capstone Projects</span>: real business questions answered with everything you learned.</li>
            <li><span className="text-accent">05</span>  The <Link href="/playground" className="text-foreground hover:text-accent transition-colors">Playground</Link>: a blank editor over the sample databases to mess around in.</li>
          </ol>
          <p className="mt-4 text-muted-foreground">Just start at the top of the module list and work down.</p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># how each lesson works</p>
          <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li><span className="text-foreground">Theory</span> explains the idea in plain words.</li>
            <li><span className="text-foreground">Examples</span> show a query running against a real database. Change a column or table and re-run them.</li>
            <li><span className="text-foreground">Challenges</span> make you write the query yourself. This is the part that builds the skill, so do not skip it.</li>
          </ul>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># how to actually learn it</p>
          <ul className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li>Write the challenges from memory before you peek. The struggle is where it sticks.</li>
            <li>Finished lessons come back for review, spaced out over days. That spacing is what turns “saw it once” into “just know it.”</li>
            <li>Short and often beats long and rare. Fifteen minutes a day will outrun a weekly cram.</li>
          </ul>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># when you get stuck</p>
          <ol className="mt-4 space-y-2 text-muted-foreground leading-relaxed">
            <li>1. Read the error. It names what broke, often a misspelled column or table.</li>
            <li>2. Re-read the prompt. Half of being stuck is a misread instruction.</li>
            <li>3. Open the hint, or check the schema viewer to see the table and column names.</li>
            <li>4. Ask the tutor (the dock at the bottom right). It nudges you toward the answer.</li>
          </ol>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/learn/start-here/welcome"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-accent text-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            begin: your first query →
          </Link>
          <Link
            href="/next-steps"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            where this leads (going pro) →
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span><span className="text-success">exit 0</span> · you can do this</span>
          <Link href="/" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">~ home</Link>
        </div>
      </footer>
    </div>
  );
}
