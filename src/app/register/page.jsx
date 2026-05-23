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

  const [step, setStep] = useState(1);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [errors, setErrors] =
    useState({});

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

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

    // REMOVE FIELD ERROR
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
          "Full name is required";

      }

      if (!form.firm_name.trim()) {

        newErrors.firm_name =
          "Firm name is required";

      }

      if (
        !form.mobile_number.trim() ||
        form.mobile_number.replace(
          /\D/g,
          ""
        ).length < 10
      ) {

        newErrors.mobile_number =
          "Valid mobile number required";

      }

      if (
        !form.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email
        )
      ) {

        newErrors.email =
          "Valid email required";

      }

    }

    // STEP 2

    if (currentStep === 2) {

      if (
        !form.account_holder_name.trim()
      ) {

        newErrors.account_holder_name =
          "Account holder name required";

      }

      if (!form.bank_name.trim()) {

        newErrors.bank_name =
          "Bank name required";

      }

      if (
        !form.account_number.trim()
      ) {

        newErrors.account_number =
          "Account number required";

      }

      if (!form.ifsc_code.trim()) {

        newErrors.ifsc_code =
          "IFSC code required";

      }

    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );

  };

  // -----------------------------
  // NEXT STEP
  // -----------------------------

  const handleNext = () => {

    if (validateStep(1)) {

      setStep(2);

    }

  };

  // -----------------------------
  // SUBMIT
  // -----------------------------

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    if (!validateStep(2)) return;

    setLoading(true);

    setApiError("");

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

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      if (!res.ok) {

        throw new Error(
          data.detail ||
            data.message ||
            "Registration failed"
        );

      }

      // -----------------------------
      // SUCCESS UI
      // -----------------------------

      setSuccess(true);

      // -----------------------------
      // AUTO LOGIN
      // -----------------------------

      localStorage.setItem(
        "arch_user_verified",
        "true"
      );

      // SAVE USER DATA

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

      // -----------------------------
      // REDIRECT
      // -----------------------------

      setTimeout(() => {

        window.location.href =
          "/profile";

      }, 1500);

    } catch (err) {

      console.error(err);

      setApiError(
        err.message ||
          "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <section className="register">

      <div className="register__card">

        {/* TOP */}

        <div className="register__top">

          <div className="register__icon">
            ✦
          </div>

          <div>

            <h1 className="register__heading">
              Create Your Account
            </h1>

            <p className="register__subtext">
              Complete your architect
              partner registration to
              access dashboard,
              rewards and profile
              features.
            </p>

            {/* PROGRESS */}

            <div className="register__progress">

              <div className="register__bar active">

                <div className="register__bar-fill"></div>

              </div>

              <div
                className={`register__bar register__bar--2 ${
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

        {/* ERROR ALERT */}

        {apiError && (

          <div className="register__alert register__alert--error">

            {apiError}

          </div>

        )}

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
              Your architect profile
              has been created
              successfully.
            </p>

            <div className="register__redirect">
              Redirecting to profile...
            </div>

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

                    <label className="register__label">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="full_name"
                      className="register__input"
                      placeholder="Enter full name"
                      value={
                        form.full_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.full_name && (
                      <p className="error-text">
                        {
                          errors.full_name
                        }
                      </p>
                    )}

                  </div>

                  {/* FIRM */}

                  <div className="register__field">

                    <label className="register__label">
                      Firm Name
                    </label>

                    <input
                      type="text"
                      name="firm_name"
                      className="register__input"
                      placeholder="Enter firm name"
                      value={
                        form.firm_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.firm_name && (
                      <p className="error-text">
                        {
                          errors.firm_name
                        }
                      </p>
                    )}

                  </div>

                  {/* MOBILE */}

                  <div className="register__field">

                    <label className="register__label">
                      Mobile Number
                    </label>

                    <input
                      type="tel"
                      name="mobile_number"
                      className="register__input"
                      placeholder="+91 9876543210"
                      value={
                        form.mobile_number
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.mobile_number && (
                      <p className="error-text">
                        {
                          errors.mobile_number
                        }
                      </p>
                    )}

                  </div>

                  {/* EMAIL */}

                  <div className="register__field">

                    <label className="register__label">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="register__input"
                      placeholder="Enter email address"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.email && (
                      <p className="error-text">
                        {
                          errors.email
                        }
                      </p>
                    )}

                  </div>

                  {/* DOB */}

                  <div className="register__field">

                    <label className="register__label">
                      Date of Birth
                    </label>

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

                    <label className="register__label">
                      Profession
                    </label>

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

                    <label className="register__label">
                      Marital Status
                    </label>

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

                      <label className="register__label">
                        Anniversary Date
                      </label>

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

                {/* ACTION */}

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

                  {/* ACCOUNT HOLDER */}

                  <div className="register__field">

                    <label className="register__label">
                      Account Holder Name
                    </label>

                    <input
                      type="text"
                      name="account_holder_name"
                      className="register__input"
                      placeholder="Enter account holder name"
                      value={
                        form.account_holder_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.account_holder_name && (
                      <p className="error-text">
                        {
                          errors.account_holder_name
                        }
                      </p>
                    )}

                  </div>

                  {/* BANK */}

                  <div className="register__field">

                    <label className="register__label">
                      Bank Name
                    </label>

                    <input
                      type="text"
                      name="bank_name"
                      className="register__input"
                      placeholder="Enter bank name"
                      value={
                        form.bank_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.bank_name && (
                      <p className="error-text">
                        {
                          errors.bank_name
                        }
                      </p>
                    )}

                  </div>

                  {/* ACCOUNT NUMBER */}

                  <div className="register__field">

                    <label className="register__label">
                      Account Number
                    </label>

                    <input
                      type="text"
                      name="account_number"
                      className="register__input"
                      placeholder="Enter account number"
                      value={
                        form.account_number
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.account_number && (
                      <p className="error-text">
                        {
                          errors.account_number
                        }
                      </p>
                    )}

                  </div>

                  {/* IFSC */}

                  <div className="register__field">

                    <label className="register__label">
                      IFSC Code
                    </label>

                    <input
                      type="text"
                      name="ifsc_code"
                      className="register__input"
                      placeholder="Enter IFSC code"
                      value={
                        form.ifsc_code
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.ifsc_code && (
                      <p className="error-text">
                        {
                          errors.ifsc_code
                        }
                      </p>
                    )}

                  </div>

                  {/* UPI */}

                  <div className="register__field register__field--full">

                    <label className="register__label">
                      UPI ID
                    </label>

                    <input
                      type="text"
                      name="upi_id"
                      className="register__input"
                      placeholder="example@upi"
                      value={
                        form.upi_id
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                {/* ACTIONS */}

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