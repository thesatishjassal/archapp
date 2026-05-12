export default function DashboardPage() {
  return (
    <div className="dash">

      {/* TOP BAR */}
      <header className="dash__top">

        <div>
          <h1>Dashboard</h1>
          <p>Overview of your architecture studio</p>
        </div>

        <a href="/profile" className="dash__btn">
          + New Project
        </a>

      </header>

      {/* STATS */}
      <section className="dash__stats">

        <div className="dash__card">
          <h2>128</h2>
          <p>Total Projects</p>
        </div>

        <div className="dash__card">
          <h2>32</h2>
          <p>Active Clients</p>
        </div>

        <div className="dash__card">
          <h2>₹24L</h2>
          <p>Total Revenue</p>
        </div>

        <div className="dash__card danger">
          <h2>5</h2>
          <p>Pending Payments</p>
        </div>

      </section>

      {/* MAIN GRID */}
      <section className="dash__grid">

        {/* RECENT PROJECTS */}
        <div className="dash__box">

          <h3>Recent Projects</h3>

          <div className="dash__item">
            <div>
              <strong>Urban Villa</strong>
              <p>Luxury residential design</p>
            </div>
            <span className="tag green">In Progress</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Office Tower</strong>
              <p>Commercial architecture</p>
            </div>
            <span className="tag blue">Review</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Hotel Concept</strong>
              <p>Interior + exterior planning</p>
            </div>
            <span className="tag gray">Completed</span>
          </div>

        </div>

        {/* COMMISSIONS */}
        <div className="dash__box">

          <h3>Latest Reward Points</h3>

          <div className="dash__item">
            <div>
              <strong>John Doe</strong>
              <p>₹12,00,000 Project</p>
            </div>
            <span className="tag green">Paid</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Studio X</strong>
              <p>₹8,50,000 Project</p>
            </div>
            <span className="tag yellow">Pending</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Nexus Group</strong>
              <p>₹25,00,000 Project</p>
            </div>
            <span className="tag blue">Review</span>
          </div>

        </div>

      </section>

    </div>
  );
}