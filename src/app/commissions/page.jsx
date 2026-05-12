export default function CommissionsTable() {
  return (
    <section className="commissionsTable">

      {/* HEADER */}
      <div className="commissionsTable__top">
        <div>
          <h1>Commissions</h1>
          <p>Track all client commissions, payments & status</p>
        </div>

        <button>+ New</button>
      </div>

      {/* TABLE */}
      <div className="tableWrap">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Party Name</th>
              <th>Project</th>
              <th>Total Amount</th>
              <th>Commission %</th>
              <th>Commission ₹</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>#A1001</td>
              <td>John Doe</td>
              <td>Modern Villa</td>
              <td>₹12,00,000</td>
              <td>8%</td>
              <td>₹96,000</td>
              <td><span className="status paid">Received</span></td>
            </tr>

            <tr>
              <td>#A1002</td>
              <td>Studio X</td>
              <td>Office Interior</td>
              <td>₹8,50,000</td>
              <td>10%</td>
              <td>₹85,000</td>
              <td><span className="status pending">Pending</span></td>
            </tr>

            <tr>
              <td>#A1003</td>
              <td>Nexus Group</td>
              <td>Commercial Tower</td>
              <td>₹25,00,000</td>
              <td>6%</td>
              <td>₹1,50,000</td>
              <td><span className="status review">In Review</span></td>
            </tr>

          </tbody>

        </table>

      </div>

    </section>
  );
}