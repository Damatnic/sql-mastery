import Link from "next/link";

const TERMS: { term: string; def: string }[] = [
  { term: "database", def: "A collection of related information, stored in tables. The thing your queries talk to." },
  { term: "table", def: "A grid of data, like a spreadsheet. One subject per table: employees, orders, products." },
  { term: "row", def: "One record in a table. One employee, one order. Also called a record." },
  { term: "column", def: "One field that every row has: a name, a price, a date. Also called a field." },
  { term: "query", def: "A question you write in SQL and run against the database to get rows back." },
  { term: "SELECT", def: "The command that reads data. `SELECT name FROM employees` means 'get me the name column.'" },
  { term: "FROM", def: "Names the table you are reading from." },
  { term: "WHERE", def: "Filters rows to only the ones that match a condition: `WHERE salary > 50000`." },
  { term: "ORDER BY", def: "Sorts the result. Add `DESC` for high-to-low." },
  { term: "LIMIT", def: "Keeps only the first N rows of the result." },
  { term: "DISTINCT", def: "Removes duplicate rows so you see each unique value once." },
  { term: "alias (AS)", def: "A temporary nickname for a column or table: `SELECT name AS employee`. Makes output and joins readable." },
  { term: "NULL", def: "An empty cell. Not zero, not blank text, just 'no value here.' Compare it with IS NULL, not =." },
  { term: "aggregate", def: "A function that boils many rows into one number: COUNT, SUM, AVG, MIN, MAX." },
  { term: "GROUP BY", def: "Splits rows into groups so an aggregate runs per group: total sales per region." },
  { term: "HAVING", def: "Like WHERE, but filters the groups after GROUP BY (e.g. only regions with sales over 1000)." },
  { term: "JOIN", def: "Combines rows from two tables that are related. INNER keeps only matches; LEFT keeps all of the left table." },
  { term: "primary key", def: "The column that uniquely identifies each row in a table, usually an id." },
  { term: "foreign key", def: "A column that points at another table's primary key. How tables connect (orders.customer_id to customers.id)." },
  { term: "subquery", def: "A query inside another query, used as a value, a filter, or a temporary table." },
  { term: "CTE (WITH)", def: "A named temporary result you define with WITH and reuse in the main query. Makes complex queries readable." },
  { term: "window function", def: "A function that calculates across a set of rows while still returning every row: running totals, rankings, row-to-row comparisons." },
  { term: "PARTITION BY", def: "Inside a window function, restarts the calculation for each group (rank within each department)." },
  { term: "RANK / ROW_NUMBER", def: "Window functions that number rows in order. ROW_NUMBER is always unique; RANK ties get the same number." },
  { term: "recursive CTE", def: "A WITH query that refers to itself, used to walk trees and hierarchies like an org chart." },
  { term: "view", def: "A saved query you can treat like a table. Read from it without rewriting the query each time." },
  { term: "index", def: "A lookup structure that lets the database find rows fast instead of scanning the whole table. The key to performance at scale." },
  { term: "transaction", def: "A group of changes that all succeed or all get undone together. BEGIN, then COMMIT to keep or ROLLBACK to cancel." },
  { term: "INSERT / UPDATE / DELETE", def: "The commands that change data: add new rows, modify existing rows, remove rows." },
  { term: "schema", def: "The shape of the database: what tables exist, their columns, types, and how they connect." },
  { term: "normalization", def: "Organizing tables so each fact is stored once, then linked, instead of copied everywhere. Stops data from going out of sync." },
  { term: "EXPLAIN", def: "Asks the database how it plans to run a query, so you can see whether it scans a whole table or uses an index." },
];

export default function GlossaryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            <span className="text-accent">$</span> cd ~
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">lessons</Link>
            <Link href="/start" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">start</Link>
            <Link href="/next-steps" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">next steps</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-semibold">Glossary</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Plain-language definitions of the words the lessons use. If a term ever trips you up, it is probably here.
          No jargon explained with more jargon.
        </p>

        <dl className="mt-8 divide-y divide-border/40 border-y border-border/60">
          {TERMS.map((t) => (
            <div key={t.term} className="py-4 grid sm:grid-cols-[11rem_1fr] gap-2 sm:gap-4">
              <dt className="text-accent">{t.term}</dt>
              <dd className="text-muted-foreground leading-relaxed">{t.def}</dd>
            </div>
          ))}
        </dl>
      </main>

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span><span className="text-success">exit 0</span> · {TERMS.length} terms</span>
          <Link href="/" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">~ home</Link>
        </div>
      </footer>
    </div>
  );
}
