"use client";

import { useState } from "react";

const INITIAL_FORM = {
  full_name: "",
  firm_name: "",
  mobile_number: "",
  email: "",
  date_of_birth: "",
  profession: "Architect",
  marital_status: "unmarried",
  anniversary_date: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

export default function RegisterPage() {

  const [step, setStep] =
    useState(1);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [errors, setErrors] =
    useState({});

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [alert, setAlert] =
    useState({
      type: "",
      message: "",
    });

  // -----------------------------
  // ALERT
  // -----------------------------

  const showAlert = (
    type,
    message
  ) => {

    setAlert({
      type,
      message,
    });

    setTimeout(() => {

      setAlert({
        type: "",
        message: "",
      });

    }, 3000);

  };

  // -----------------------------
  // INPUT CHANGE
  // -----------------------------

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));

    }

  };

  // -----------------------------
  // VALIDATION
  // -----------------------------

  const validateStep = (
    currentStep
  ) => {

    const newErrors = {};

    // STEP 1

    if (currentStep === 1) {

      if (!form.full_name.trim()) {

        newErrors.full_name =
          "Required";

      }

      if (!form.firm_name.trim()) {

        newErrors.firm_name =
          "Required";

      }

      if (
        !form.mobile_number.trim() ||
        form.mobile_number.replace(
          /\D/g,
          ""
        ).length < 10
      ) {

        newErrors.mobile_number =
          "Invalid number";

      }

      if (
        !form.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email
        )
      ) {

        newErrors.email =
          "Invalid email";

      }

    }

    // STEP 2

    if (currentStep === 2) {

      if (
        !form.account_holder_name.trim()
      ) {

        newErrors.account_holder_name =
          "Required";

      }

      if (!form.bank_name.trim()) {

        newErrors.bank_name =
          "Required";

      }

      if (
        !form.account_number.trim()
      ) {

        newErrors.account_number =
          "Required";

      }

      if (!form.ifsc_code.trim()) {

        newErrors.ifsc_code =
          "Required";

      }

    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );

  };

  // -----------------------------
  // NEXT
  // -----------------------------

  const handleNext = () => {

    if (validateStep(1)) {

      showAlert(
        "success",
        "Step completed"
      );

      setStep(2);

    } else {

      showAlert(
        "error",
        "Please complete required fields"
      );

    }

  };

  // -----------------------------
  // SUBMIT
  // -----------------------------

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    if (!validateStep(2)) {

      showAlert(
        "error",
        "Please complete required fields"
      );

      return;

    }

    setLoading(true);

    try {

      const payload = {

        full_name:
          form.full_name,

        firm_name:
          form.firm_name,

        mobile_number:
          form.mobile_number,

        email:
          form.email,

        date_of_birth:
          form.date_of_birth ||
          null,

        profession:
          form.profession,

        marital_status:
          form.marital_status,

        anniversary_date:
          form.marital_status ===
          "married"
            ? form.anniversary_date ||
              null
            : null,

        account_holder_name:
          form.account_holder_name,

        bank_name:
          form.bank_name,

        account_number:
          form.account_number,

        ifsc_code:
          form.ifsc_code,

        upi_id:
          form.upi_id || null,

      };

      const res = await fetch(
        "https://api.panvic.in/api/arch-register/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {

        throw new Error(
          data.detail ||
            data.message ||
            "Registration failed"
        );

      }

      setSuccess(true);

      showAlert(
        "success",
        "Registration successful"
      );

      localStorage.setItem(
        "arch_user_verified",
        "true"
      );

      localStorage.setItem(
        "arch_user",
        JSON.stringify({
          name: form.full_name,
          email: form.email,
          mobile:
            form.mobile_number,
          profession:
            form.profession,
          firm_name:
            form.firm_name,
        })
      );

      setTimeout(() => {

        window.location.href =
          "/profile";

      }, 1500);

    } catch (err) {

      console.error(err);

      showAlert(
        "error",
        err.message ||
          "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="register">

      {/* ALERT */}

      {alert.message && (

        <div
          className={`register__toast register__toast--${alert.type}`}
        >

          <div className="register__toast-dot"></div>

          <span>
            {alert.message}
          </span>

        </div>

      )}

      <div className="register__card">

        {/* TOP */}

        <div className="register__top">

          <div>

            <h1 className="register__heading">
              Create Your Account
            </h1>

            <p className="register__subtext">
              Complete your architect
              partner registration to
              access dashboard and
              rewards.
            </p>

            {/* PROGRESS */}

            <div className="register__progress">

              <div className="register__bar active">

                <div className="register__bar-fill"></div>

              </div>

              <div
                className={`register__bar ${
                  step === 2
                    ? "active"
                    : ""
                }`}
              >

                <div className="register__bar-fill"></div>

              </div>

            </div>

          </div>

        </div>

        {/* SUCCESS */}

        {success ? (

          <div className="register__success active">

            <div className="register__success-icon">
              ✓
            </div>

            <h2 className="register__success-title">
              Registration Complete
            </h2>

            <p className="register__success-text">
              Redirecting to your
              profile...
            </p>

          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* STEP 1 */}

            {step === 1 && (

              <div className="register__step active">

                <div className="register__grid">

                  {/* FULL NAME */}

                  <div className="register__field">

                    <input
                      type="text"
                      name="full_name"
                      className={`register__input ${
                        errors.full_name
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Full Name"
                      value={
                        form.full_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* FIRM */}

                  <div className="register__field">

                    <input
                      type="text"
                      name="firm_name"
                      className={`register__input ${
                        errors.firm_name
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Firm Name"
                      value={
                        form.firm_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* MOBILE */}

                  <div className="register__field">

                    <input
                      type="tel"
                      name="mobile_number"
                      className={`register__input ${
                        errors.mobile_number
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Mobile Number"
                      value={
                        form.mobile_number
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="register__field">

                    <input
                      type="email"
                      name="email"
                      className={`register__input ${
                        errors.email
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Email Address"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* DOB */}

                  <div className="register__field">

                    <input
                      type="date"
                      name="date_of_birth"
                      className="register__input"
                      value={
                        form.date_of_birth
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {/* PROFESSION */}

                  <div className="register__field">

                    <select
                      name="profession"
                      className="register__select"
                      value={
                        form.profession
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="Architect">
                        Architect
                      </option>

                      <option value="Interior Designer">
                        Interior Designer
                      </option>

                    </select>

                  </div>

                  {/* MARITAL */}

                  <div className="register__field register__field--full">

                    <div className="register__radio-wrap">

                      <label className="register__radio">

                        <input
                          type="radio"
                          name="marital_status"
                          value="married"
                          checked={
                            form.marital_status ===
                            "married"
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <span>
                          Married
                        </span>

                      </label>

                      <label className="register__radio">

                        <input
                          type="radio"
                          name="marital_status"
                          value="unmarried"
                          checked={
                            form.marital_status ===
                            "unmarried"
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <span>
                          Unmarried
                        </span>

                      </label>

                    </div>

                  </div>

                  {/* ANNIVERSARY */}

                  {form.marital_status ===
                    "married" && (

                    <div className="register__field">

                      <input
                        type="date"
                        name="anniversary_date"
                        className="register__input"
                        value={
                          form.anniversary_date
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                  )}

                </div>

                <div className="register__actions">

                  <button
                    type="button"
                    className="register__button"
                    onClick={
                      handleNext
                    }
                  >
                    Continue
                  </button>

                </div>

              </div>

            )}

            {/* STEP 2 */}

            {step === 2 && (

              <div className="register__step active">

                <div className="register__grid">

                  <div className="register__field">

                    <input
                      type="text"
                      name="account_holder_name"
                      className={`register__input ${
                        errors.account_holder_name
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Account Holder Name"
                      value={
                        form.account_holder_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="register__field">

                    <input
                      type="text"
                      name="bank_name"
                      className={`register__input ${
                        errors.bank_name
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Bank Name"
                      value={
                        form.bank_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="register__field">

                    <input
                      type="text"
                      name="account_number"
                      className={`register__input ${
                        errors.account_number
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Account Number"
                      value={
                        form.account_number
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="register__field">

                    <input
                      type="text"
                      name="ifsc_code"
                      className={`register__input ${
                        errors.ifsc_code
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="IFSC Code"
                      value={
                        form.ifsc_code
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="register__field register__field--full">

                    <input
                      type="text"
                      name="upi_id"
                      className="register__input"
                      placeholder="UPI ID"
                      value={
                        form.upi_id
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                <div className="register__actions">

                  <button
                    type="button"
                    className="register__button register__button--light"
                    onClick={() => {

                      setErrors({});
                      setStep(1);

                    }}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="register__button"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Complete Registration"}
                  </button>

                </div>

              </div>

            )}

          </form>

        )}

      </div>

    </section>

  );

}