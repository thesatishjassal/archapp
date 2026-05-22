'use client';

import { useState } from 'react';

export default function LoginPage() {

  const [step, setStep] = useState(1); 
  // 1 = email, 2 = otp

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // -------------------------
  // SEND OTP
  // -------------------------
  const sendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        'https://api.panvic.in/api/arch-auth/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to send OTP');
      }

      setStep(2);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // VERIFY OTP
  // -------------------------
  const verifyOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(
        'https://api.panvic.in/api/arch-auth/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid OTP');
      }

      setSuccess(true);

      // optional redirect after login
      localStorage.setItem('arch_user_verified', 'true');

      // window.location.href = "/dashboard";

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div className="login__card">

        {/* TOP */}
        <div className="login__top">
          <div className="login__icon">⌁</div>

          <div>
            <h1 className="login__heading">
              Login with OTP
            </h1>

            <p className="login__subtext">
              Enter your email and verify OTP to continue.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="login__error">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="login__success">
            Login successful 🎉
          </div>
        )}

        {/* STEP 1 → EMAIL */}
        {step === 1 && (
          <form onSubmit={sendOtp} className="login__form">

            <div className="login__field">
              <label className="login__label">
                Email Address
              </label>

              <input
                type="email"
                className="login__input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <button
              className="login__button"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

          </form>
        )}

        {/* STEP 2 → OTP VERIFY */}
        {step === 2 && (
          <form onSubmit={verifyOtp} className="login__form">

            <div className="login__field">
              <label className="login__label">
                Enter OTP
              </label>

              <input
                type="text"
                className="login__input"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                maxLength={6}
                required
              />
            </div>

            <button
              className="login__button"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* BACK BUTTON */}
            <button
              type="button"
              className="login__button login__button--light"
              onClick={() => setStep(1)}
              style={{ marginTop: '10px' }}
            >
              Change Email
            </button>

          </form>
        )}

        {/* BOTTOM */}
        <div className="login__bottom">
          Don’t have an account?
          <a href="/register"> Register Now</a>
        </div>

      </div>
    </section>
  );
}