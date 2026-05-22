"use client";

import { useState } from "react";

export default function ArchitectProjects() {
  const [open, setOpen] = useState(false);

  return (
    <section className="architectProjects">
      <div className="commissionsTable__top">

        <div>
          <h1>Assigned Projects</h1>
          <p>Assign projects to architects, designers & sales representatives</p>
        </div>

        <button onClick={() => setOpen(true)}>
          + New
        </button>

      </div>

      {/* HEADER */}
      {/* TABLE */}
      <div className="tableWrap">

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Architect</th>
              <th>Client</th>
              <th>Project</th>
              <th>Salesperson</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>#PR1021</td>
              <td>Rahul Arora</td>
              <td>Skyline Builders</td>
              <td>Luxury Penthouse</td>
              <td>Aman Sharma</td>
              <td>Delhi</td>
              <td>
                <span className="status active">
                  Assigned
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {open && (
        <div
          className="modalOverlay"
          onClick={() => setOpen(false)}
        >

          <div
            className="modalBox large"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="modalHeader">

              <div>
                <h2>Assign New Project</h2>
                <p>
                  Assign architect projects to internal sales team
                </p>
              </div>

              <button onClick={() => setOpen(false)}>
                ✕
              </button>

            </div>

            {/* BODY */}
            <div className="modalBody grid">

              <div className="field">
                <label>Architect Name</label>
                <input placeholder="Enter architect name" />
              </div>

              <div className="field">
                <label>Client / Company</label>
                <input placeholder="Client company name" />
              </div>

              <div className="field">
                <label>Project Name</label>
                <input placeholder="Project title" />
              </div>

              <div className="field">
                <label>Project Type</label>

                <select>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Hospitality</option>
                  <option>Retail</option>
                </select>
              </div>

              <div className="field">
                <label>Salesperson</label>

                <select>
                  <option>Select Salesperson</option>
                  <option>Aman Sharma</option>
                  <option>Ritika Jain</option>
                  <option>Karan Malhotra</option>
                </select>
              </div>

              <div className="field">
                <label>Expected Deal Value</label>
                <input
                  type="number"
                  placeholder="₹ 0.00"
                />
              </div>

              <div className="field">
                <label>Project Location</label>
                <input placeholder="City / Site Location" />
              </div>

              <div className="field">
                <label>Priority</label>

                <select>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="field full">
                <label>Project Notes</label>

                <textarea
                  rows="5"
                  placeholder="Add project requirements, lighting preferences, timelines etc..."
                />
              </div>

            </div>

            {/* FOOTER */}
            <div className="modalFooter">

              <button
                className="cancel"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button className="save">
                Assign Project
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}