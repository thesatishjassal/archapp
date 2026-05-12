"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [maritalStatus, setMaritalStatus] =
    useState("unmarried");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <>
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
                Complete your architect partner
                registration to access commissions,
                payouts and dashboard features.
              </p>

              {/* PROGRESS */}

              <div className="register__progress">

                <div className="register__bar active">
                  <div className="register__bar-fill"></div>
                </div>

                <div
                  className={`register__bar register__bar--2 ${
                    step === 2 ? "active" : ""
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
                Your architect partner profile has
                been submitted successfully.
              </p>

            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              {/* STEP 1 */}

              {step === 1 && (

                <div className="register__step active">

                  <div className="register__grid">

                    <div className="register__field">

                      <label className="register__label">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter full name"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Firm Name
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter firm name"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Mobile Number
                      </label>

                      <input
                        type="tel"
                        className="register__input"
                        placeholder="+91 9876543210"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Email Address
                      </label>

                      <input
                        type="email"
                        className="register__input"
                        placeholder="Enter email address"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        className="register__input"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Profession
                      </label>

                      <select className="register__select">

                        <option>
                          Architect
                        </option>

                        <option>
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
                            name="marital"
                            value="married"
                            checked={
                              maritalStatus === "married"
                            }
                            onChange={(e) =>
                              setMaritalStatus(
                                e.target.value
                              )
                            }
                          />

                          <span>
                            Married
                          </span>

                        </label>

                        <label className="register__radio">

                          <input
                            type="radio"
                            name="marital"
                            value="unmarried"
                            checked={
                              maritalStatus ===
                              "unmarried"
                            }
                            onChange={(e) =>
                              setMaritalStatus(
                                e.target.value
                              )
                            }
                          />

                          <span>
                            Unmarried
                          </span>

                        </label>

                      </div>

                    </div>

                    {/* ANNIVERSARY */}

                    {maritalStatus === "married" && (

                      <div className="register__field">

                        <label className="register__label">
                          Anniversary Date
                        </label>

                        <input
                          type="date"
                          className="register__input"
                        />

                      </div>

                    )}

                  </div>

                  {/* BUTTON */}

                  <div className="register__actions">

                    <button
                      type="button"
                      className="register__button"
                      onClick={() => setStep(2)}
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

                      <label className="register__label">
                        Account Holder Name
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter account holder name"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Bank Name
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter bank name"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        Account Number
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter account number"
                      />

                    </div>

                    <div className="register__field">

                      <label className="register__label">
                        IFSC Code
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="Enter IFSC code"
                      />

                    </div>

                    <div className="register__field register__field--full">

                      <label className="register__label">
                        UPI ID
                      </label>

                      <input
                        type="text"
                        className="register__input"
                        placeholder="example@upi"
                      />

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="register__actions">

                    <button
                      type="button"
                      className="register__button register__button--light"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="register__button"
                    >
                      Complete Registration
                    </button>

                  </div>

                </div>

              )}

            </form>

          )}

        </div>

      </section>


    </>
  );
}