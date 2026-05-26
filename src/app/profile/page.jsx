"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  /* ================= MODALS ================= */
  const [editProjectModal, setEditProjectModal] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
const [detailsModal, setDetailsModal] =
  useState(false);

const [activeCategory, setActiveCategory] =
  useState("");
  const [open, setOpen] = useState(false);
const [projects, setProjects] =
  useState([
    {
      id: 1,
      title:
        "Modern Courtyard Villa",

      location:
        "Gurgaon, India",

      description:
        "Luxury residential villa focused on open courtyard living, natural ventilation and soft minimal interiors.",

      status:
        "Completed",

      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop",
    },

    {
      id: 2,
      title:
        "Skyline Workspace",

      location:
        "Bangalore, India",

      description:
        "Contemporary office workspace designed with collaborative zones, natural light and sustainable materials.",

      status:
        "In Progress",

      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop",
    },

    {
      id: 3,
      title:
        "Minimal Lake House",

      location:
        "Udaipur, India",

      description:
        "Calm waterfront retreat designed using exposed concrete, wood textures and panoramic lake-facing glazing.",

      status:
        "Completed",

      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop",
    },

    {
      id: 4,
      title:
        "Urban Green Residence",

      location:
        "Noida, India",

      description:
        "Smart eco-friendly home integrating vertical gardens, passive cooling and functional family spaces.",

      status:
        "In Progress",

      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop",
    },

    {
      id: 5,
      title:
        "Luxury Penthouse Interior",

      location:
        "Mumbai, India",

      description:
        "High-end penthouse interior blending soft lighting, premium marble finishes and modern spatial flow.",

      status:
        "Completed",

      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1400&auto=format&fit=crop",
    },

    {
      id: 6,
      title:
        "Nature Inspired Café",

      location:
        "Chandigarh, India",

      description:
        "Biophilic café concept with earthy textures, indoor greens and a warm community-centered layout.",

      status:
        "Completed",

      image:
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1400&auto=format&fit=crop",
    },
  ]);
  /* ================= PROFILE STATE ================= */

  const [profileData, setProfileData] = useState({
    name: "",
    profession: "",
    work: "",
    bio: "",
    location: "India",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    email: "",
    mobile: "",
    dob: "",
    firm_name: "",
    marital_status: "",
    bank_name: "",
    upi_id: "",
  });

  /* ================= FETCH USER ================= */
const openCategoryModal = (
  category
) => {

  setActiveCategory(
    category
  );

  setDetailsModal(true);

};
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("arch_user"));

        if (!localUser?.email) return;

        const res = await fetch("https://api.panvic.in/api/arch-register/");

        const data = await res.json();

        const currentUser = data.find((user) => user.email === localUser.email);

        if (currentUser) {
          setProfileData({
            name: currentUser.full_name || "",

            profession: currentUser.profession || "",

            work: currentUser.firm_name || "",

            bio: "Minimal architect focused on elegant and modern living spaces.",

            location: "India",

            profileImage:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",

            email: currentUser.email || "",

            mobile: currentUser.mobile_number || "",

            dob: currentUser.date_of_birth || "",

            firm_name: currentUser.firm_name || "",

            marital_status: currentUser.marital_status || "",

            bank_name: currentUser.bank_name || "",

            upi_id: currentUser.upi_id || "",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchCurrentUser();
  }, []);

  /* ================= PROJECT FORM ================= */

  const [projectForm, setProjectForm] = useState({
    title: "",
    location: "",
    description: "",
    status: "In Progress",
    image: "",
  });

  /* ================= PROFILE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= PROFILE IMAGE ================= */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setProfileData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
    }
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = () => {
    setShowEditModal(false);
  };

  /* ================= PROJECT INPUT ================= */

  const handleProjectChange = (e) => {
    const { name, value } = e.target;

    setProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= PROJECT IMAGE ================= */

  const handleProjectImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setProjectForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    }
  };

  /* ================= SAVE PROJECT ================= */

const handleAddProject = (
  e
) => {

  e.preventDefault();

  // UPDATE EXISTING

  if (editingProjectId) {

    setProjects((prev) =>
      prev.map((project) =>

        project.id ===
        editingProjectId
          ? {
              ...project,
              ...projectForm,
            }
          : project
      )
    );

    setEditingProjectId(
      null
    );

    setEditProjectModal(
      false
    );

  } else {

    // ADD NEW

    const newProject = {
      id: Date.now(),
      ...projectForm,
    };

    setProjects(
      (prev) => [
        newProject,
        ...prev,
      ]
    );

    setOpen(false);

  }

  // RESET FORM

  setProjectForm({
    title: "",
    location: "",
    description:
      "",
    status:
      "In Progress",
    image: "",
  });

};const handleEditProject = (
  project
) => {

  setProjectForm({
    title:
      project.title,
    location:
      project.location,
    description:
      project.description,
    status:
      project.status,
    image:
      project.image,
  });

  setEditingProjectId(
    project.id
  );

  setEditProjectModal(
    true
  );

};
  return (
    <section className="profile">
      <div className="profile__container">
        {/* ================= HEADER ================= */}

        <header className="profile__header">
          <h1 className="profile__username">{profileData.name}</h1>

          <button className="profile__menu-btn">☰</button>
        </header>

        {/* ================= PROFILE ================= */}

        <div className="profile__info-main">
          {/* AVATAR */}

          <div className="profile__avatar-wrapper">
            <label htmlFor="profileUpload" className="profile__avatar-upload">
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="profile__avatar-img"
              />
            </label>

            <input
              id="profileUpload"
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* INFO */}

          <div className="profile__name-role">
            <h2>{profileData.name}</h2>

            <p>{profileData.profession}</p>

            {/* <span className="profile__work">{profileData.work}</span> */}
          </div>

          {/* BIO */}

          <p className="profile__bio">{profileData.bio}</p>

          {/* LOCATION */}

          <div className="profile__location">📍 {profileData.location}</div>

          {/* ACTIONS */}

          <div className="profile__actions">
            <button
              className="profile__edit-btn"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>

            <button
              className="profile__share-btn"
              onClick={() => setOpen(true)}
            >
              + Add Project
            </button>
          </div>

          {/* DETAILS */}

          {/* ================= CATEGORY DETAILS ================= */}

          <div className="profile__tabs">
            {/* PERSONAL */}

            <div className="profile__tab-card">
<div className="profile__tab-head">

  <h3>
    Personal Details
  </h3>

  <button
    className="profile__tab-edit"
    onClick={() =>
      openCategoryModal(
        "personal"
      )
    }
  >
    Edit
  </button>

</div>

              <div className="profile__tab-grid">
                <div className="profile__item">
                  <span>Full Name</span>

                  <h4>{profileData.name}</h4>
                </div>

                <div className="profile__item">
                  <span>Mobile</span>

                  <h4>{profileData.mobile}</h4>
                </div>

                <div className="profile__item">
                  <span>Email</span>

                  <h4>{profileData.email}</h4>
                </div>

                <div className="profile__item">
                  <span>DOB</span>

                  <h4>{profileData.dob}</h4>
                </div>

                <div className="profile__item">
                  <span>Marital Status</span>

                  <h4>{profileData.marital_status}</h4>
                </div>
              </div>
            </div>

            {/* PROFESSIONAL */}

            <div className="profile__tab-card">
              <div className="profile__tab-head">
                <h3>Professional Details</h3><button
  className="profile__tab-edit"
  onClick={() =>
    openCategoryModal(
      "professional"
    )
  }
>
  Edit
</button>
              </div>

              <div className="profile__tab-grid">
                <div className="profile__item">
                  <span>Profession</span>

                  <h4>{profileData.profession}</h4>
                </div>

                <div className="profile__item">
                  <span>Firm Name</span>

                  <h4>{profileData.firm_name}</h4>
                </div>

                <div className="profile__item">
                  <span>Work</span>

                  <h4>{profileData.work}</h4>
                </div>

                <div className="profile__item">
                  <span>Location</span>

                  <h4>{profileData.location}</h4>
                </div>
              </div>
            </div>

            {/* BANK */}

<div className="profile__tab-card">

  <div className="profile__tab-head">

    <h3>
      Bank Details
    </h3>

    <button
      className="profile__tab-edit"
      onClick={() =>
        openCategoryModal(
          "bank"
        )
      }
    >
      Edit
    </button>

  </div>

  <div className="profile__tab-grid">

    {/* BANK NAME */}

    <div className="profile__item">

      <span>
        Bank Name
      </span>

      <h4>
        {
          profileData.bank_name
        }
      </h4>

    </div>

    {/* ACCOUNT HOLDER */}

    <div className="profile__item">

      <span>
        Account Holder
      </span>

      <h4>
        {
          profileData.account_holder_name
        }
      </h4>

    </div>

    {/* ACCOUNT NUMBER */}

    <div className="profile__item">

      <span>
        Account Number
      </span>

      <h4>
        {
          profileData.account_number
        }
      </h4>

    </div>

    {/* IFSC */}

    <div className="profile__item">

      <span>
        IFSC Code
      </span>

      <h4>
        {
          profileData.ifsc_code
        }
      </h4>

    </div>

    {/* UPI */}

    <div className="profile__item">

      <span>
        UPI ID
      </span>

      <h4>
        {
          profileData.upi_id
        }
      </h4>

    </div>

  </div>

</div>
          </div>
        </div>

        {/* ================= PROJECTS ================= */}

        <div className="profile__section">
          <div className="profile__section-header">
            <h3>Projects</h3>
          </div>

<div className="profile__section">

  {projects.length > 0 ? (

    <div className="profile__projects-grid">

      {projects.map(
        (project) => (

          <div
            key={project.id}
            className="profile__project-card"
          >

            <div className="profile__project-image">

              <img
                src={project.image}
                alt={project.title}
                className="profile__project-img"
              />

              <div
                className={`profile__badge ${
                  project.status ===
                  "Completed"
                    ? "completed"
                    : "in-progress"
                }`}
              >

                {project.status}

              </div>

            </div>

            <div className="profile__project-info">
<div className="profile__project-actions">

  <button
    className="profile__project-edit"
    onClick={() =>
      handleEditProject(
        project
      )
    }
  >

    Edit Project

  </button>

</div>
              <h4>
                {project.title}
              </h4>

              <p>
                {project.location}
              </p>

              <div className="profile__project-desc">

                {
                  project.description
                }

              </div>

            </div>

          </div>

        )
      )}

    </div>

  ) : (

    <div className="profile__empty">

      <h4>
        No Projects Yet
      </h4>

      <p>
        Start uploading your architecture projects.
      </p>

    </div>

  )}

</div>
        </div>
      </div>

      {/* ================= ADD PROJECT MODAL ================= */}
{/* ================= CATEGORY DETAILS MODAL ================= */}

{detailsModal && (

  <div
    className="modal__overlay"
    onClick={() =>
      setDetailsModal(
        false
      )
    }
  >

    <div
      className="modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <h2 className="modal__title">

        {activeCategory ===
        "personal"
          ? "Edit Personal Details"
          : activeCategory ===
            "professional"
          ? "Edit Professional Details"
          : "Edit Bank Details"}

      </h2>

      <div className="modal__form">

        {/* PERSONAL */}

        {activeCategory ===
          "personal" && (

          <>

            <input
              type="text"
              name="name"
              className="modal__input"
              placeholder="Full Name"
              value={
                profileData.name
              }
              onChange={
                handleChange
              }
            />

            <input
              type="text"
              name="mobile"
              className="modal__input"
              placeholder="Mobile Number"
              value={
                profileData.mobile
              }
              onChange={
                handleChange
              }
            />

            <input
              type="email"
              name="email"
              className="modal__input"
              placeholder="Email"
              value={
                profileData.email
              }
              onChange={
                handleChange
              }
            />

            <input
              type="date"
              name="dob"
              className="modal__input"
              value={
                profileData.dob
              }
              onChange={
                handleChange
              }
            />

          </>

        )}

        {/* PROFESSIONAL */}

        {activeCategory ===
          "professional" && (

          <>

            <input
              type="text"
              name="profession"
              className="modal__input"
              placeholder="Profession"
              value={
                profileData.profession
              }
              onChange={
                handleChange
              }
            />

            <input
              type="text"
              name="firm_name"
              className="modal__input"
              placeholder="Firm Name"
              value={
                profileData.firm_name
              }
              onChange={
                handleChange
              }
            />

            <input
              type="text"
              name="work"
              className="modal__input"
              placeholder="Work"
              value={
                profileData.work
              }
              onChange={
                handleChange
              }
            />

            <input
              type="text"
              name="location"
              className="modal__input"
              placeholder="Location"
              value={
                profileData.location
              }
              onChange={
                handleChange
              }
            />

          </>

        )}

        {/* BANK */}

       {activeCategory ===
  "bank" && (

  <>

    {/* BANK NAME */}

    <input
      type="text"
      name="bank_name"
      className="modal__input"
      placeholder="Bank Name"
      value={
        profileData.bank_name
      }
      onChange={
        handleChange
      }
    />

    {/* ACCOUNT HOLDER */}

    <input
      type="text"
      name="account_holder_name"
      className="modal__input"
      placeholder="Account Holder Name"
      value={
        profileData.account_holder_name
      }
      onChange={
        handleChange
      }
    />

    {/* ACCOUNT NUMBER */}

    <input
      type="text"
      name="account_number"
      className="modal__input"
      placeholder="Account Number"
      value={
        profileData.account_number
      }
      onChange={
        handleChange
      }
    />

    {/* IFSC */}

    <input
      type="text"
      name="ifsc_code"
      className="modal__input"
      placeholder="IFSC Code"
      value={
        profileData.ifsc_code
      }
      onChange={
        handleChange
      }
    />

    {/* UPI */}

    <input
      type="text"
      name="upi_id"
      className="modal__input"
      placeholder="UPI ID"
      value={
        profileData.upi_id
      }
      onChange={
        handleChange
      }
    />

  </>

)}
        <div className="modal__actions">

          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={() =>
              setDetailsModal(
                false
              )
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal__btn"
            onClick={() =>
              setDetailsModal(
                false
              )
            }
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  </div>

)}
      {open && (
        <div className="modal__overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Add Project</h2>

            <form className="modal__form" onSubmit={handleAddProject}>
              <div className="projectUpload">
                <label htmlFor="projectImage" className="projectUpload__label">
                  {projectForm.image ? (
                    <img
                      src={projectForm.image}
                      alt="Project"
                      className="projectUpload__preview"
                    />
                  ) : (
                    <div className="projectUpload__placeholder">
                      Upload Image
                    </div>
                  )}
                </label>

                <input
                  id="projectImage"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProjectImage}
                />
              </div>

              <input
                className="modal__input"
                type="text"
                name="title"
                value={projectForm.title}
                onChange={handleProjectChange}
                placeholder="Project Name"
                required
              />

              <input
                className="modal__input"
                type="text"
                name="location"
                value={projectForm.location}
                onChange={handleProjectChange}
                placeholder="Location"
              />

              <textarea
                className="modal__input modal__textarea"
                name="description"
                value={projectForm.description}
                onChange={handleProjectChange}
                placeholder="Description"
              />

              <div className="modal__actions">
                <button
                  type="button"
                  className="modal__btn modal__btn--ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="modal__btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{/* ================= EDIT PROFILE MODAL ================= */}

{showEditModal && (

  <div
    className="modal__overlay"
    onClick={() =>
      setShowEditModal(
        false
      )
    }
  >

    <div
      className="modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <h2 className="modal__title">
        Edit Profile
      </h2>

      <div className="modal__form">

        <input
          type="text"
          name="name"
          className="modal__input"
          placeholder="Full Name"
          value={
            profileData.name
          }
          onChange={
            handleChange
          }
        />

        <input
          type="text"
          name="profession"
          className="modal__input"
          placeholder="Profession"
          value={
            profileData.profession
          }
          onChange={
            handleChange
          }
        />

        <input
          type="text"
          name="work"
          className="modal__input"
          placeholder="Work / Firm"
          value={
            profileData.work
          }
          onChange={
            handleChange
          }
        />

        <textarea
          name="bio"
          className="modal__input modal__textarea"
          placeholder="Bio"
          value={
            profileData.bio
          }
          onChange={
            handleChange
          }
        />

        <input
          type="text"
          name="location"
          className="modal__input"
          placeholder="Location"
          value={
            profileData.location
          }
          onChange={
            handleChange
          }
        />

        <div className="modal__actions">

          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={() =>
              setShowEditModal(
                false
              )
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal__btn"
            onClick={
              handleSave
            }
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  </div>

)}{/* ================= EDIT PROJECT MODAL ================= */}

{editProjectModal && (

  <div
    className="modal__overlay"
    onClick={() => {

      setEditProjectModal(
        false
      );

      setEditingProjectId(
        null
      );

    }}
  >

    <div
      className="modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <h2 className="modal__title">
        Edit Project
      </h2>

      <form
        className="modal__form"
        onSubmit={
          handleAddProject
        }
      >

        <div className="projectUpload">

          <label
            htmlFor="editProjectImage"
            className="projectUpload__label"
          >

            {projectForm.image ? (

              <img
                src={
                  projectForm.image
                }
                alt="Project"
                className="projectUpload__preview"
              />

            ) : (

              <div className="projectUpload__placeholder">
                Upload Image
              </div>

            )}

          </label>

          <input
            id="editProjectImage"
            type="file"
            hidden
            accept="image/*"
            onChange={
              handleProjectImage
            }
          />

        </div>

        <input
          className="modal__input"
          type="text"
          name="title"
          value={
            projectForm.title
          }
          onChange={
            handleProjectChange
          }
          placeholder="Project Name"
        />

        <input
          className="modal__input"
          type="text"
          name="location"
          value={
            projectForm.location
          }
          onChange={
            handleProjectChange
          }
          placeholder="Location"
        />

        <textarea
          className="modal__input modal__textarea"
          name="description"
          value={
            projectForm.description
          }
          onChange={
            handleProjectChange
          }
          placeholder="Description"
        />

        <select
          className="modal__input"
          name="status"
          value={
            projectForm.status
          }
          onChange={
            handleProjectChange
          }
        >

          <option>
            In Progress
          </option>

          <option>
            Completed
          </option>

        </select>

        <div className="modal__actions">

          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={() => {

              setEditProjectModal(
                false
              );

              setEditingProjectId(
                null
              );

            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="modal__btn"
          >
            Update Project
          </button>

        </div>

      </form>

    </div>

  </div>

)}
    </section>
  );
}
