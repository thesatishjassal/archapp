"use client";
import { useState } from "react";

export default function CommissionsTable() {

  const [open, setOpen] = useState(false);

  return (
    <section className="commissionsTable">

      {/* HEADER */}
      <div className="commissionsTable__top">

        <div>
          <h1>Reward Points</h1>
          <p>Track all client Reward Points, payments & status</p>
        </div>

        <button onClick={() => setOpen(true)}>
          + New
        </button>

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
              <th>Reward Points %</th>
              <th>Reward Points ₹</th>
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

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {open && (
        <div className="modalOverlay" onClick={() => setOpen(false)}>

          <div className="modalBox" onClick={(e) => e.stopPropagation()}>

            <div className="modalHeader">
              <h2>Add Commission</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="modalBody">

              <input placeholder="Party Name" />
              <input placeholder="Project Name" />
              <input type="number" placeholder="Total Amount (₹)" />
              <input type="number" placeholder="Reward Points %" />

              <select>
                <option>Pending</option>
                <option>Received</option>
                <option>In Review</option>
              </select>

            </div>

            <div className="modalFooter">

              <button
                className="cancel"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button className="save">
                Save Reward Points
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}