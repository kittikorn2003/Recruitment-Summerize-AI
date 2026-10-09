import React, { useState } from 'react'
import axios from 'axios';
import LoginButton from '../components/LoginButton';
import "../pages/AuthForm.css"
import Modal from '../components/Modal';

function Register({ onClose, onSwitchToSignIn }) {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreeToTerms) {
            alert('Please agree to the Terms and Conditions before registering.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:3000/api/auth/register',
                {
                    email: email,
                    username: username,
                    password: password
                }
            );

            console.log('Register Success', response.data);

            onClose();
            onSwitchToSignIn();

        } catch (error) {
            if (error.response) {
                console.error('Server Error:', error.response.data);
            } else {
                console.error('Network Error:', error.message);
            }
        }
    }

    return (
        <Modal onClose={onClose}>
            <form onSubmit={handleSubmit} className="auth-form">

                <h2>REGISTER</h2>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="terms-container">

                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />

                    <label htmlFor="terms">
                        I agree to the{' '}
                        <button
                            type="button"
                            className="terms-link"
                            onClick={() => setShowTerms(true)}
                        >
                            Terms of Service.
                        </button>
                    </label>

                </div>

                {/* Register Button */}
                <LoginButton
                    label="Register"
                    type="submit"
                />

                {/* Sign In */}
                <div className="signin-text">
                    <span className="link-text">
                        Have an account?
                    </span>

                    <button
                        type="button"
                        className="link-btn"
                        onClick={onSwitchToSignIn}
                    >
                        Sign In here
                    </button>
                </div>

            </form>

            {/* =========================
                Terms Modal
            ========================= */}

            {showTerms && (
                <Modal onClose={() => setShowTerms(false)}>

                    <div className="terms-modal">

                        <h2>Terms and Conditions</h2>

                        <div className="terms-content">

                            <section>
                                <h3>1. Acceptance of Terms</h3>
                                <p>
                                    By creating an account and using Resume-AI,
                                    you agree to comply with these Terms and
                                    Conditions.
                                </p>
                            </section>

                            <section>
                                <h3>2. User Account</h3>
                                <p>
                                    You are responsible for providing accurate
                                    information and maintaining the security
                                    of your account.
                                </p>
                            </section>

                            <section>
                                <h3>3. Resume Information</h3>
                                <p>
                                    You are responsible for ensuring that the
                                    information provided in your resume is
                                    accurate and that you have the right to
                                    upload and use the information provided.
                                </p>
                            </section>

                            <section>
                                <h3>4. AI Processing</h3>
                                <p>
                                    Resume-AI uses AI technology to analyze,
                                    extract, search, and summarize resume
                                    information. AI-generated results may not
                                    always be completely accurate and should
                                    be reviewed by the user.
                                </p>
                            </section>

                            <section>
                                <h3>5. Privacy and Data</h3>
                                <p>
                                    Resume-AI may collect and process
                                    information provided by users, including
                                    resume and account information, to provide
                                    and improve the service.
                                </p>
                            </section>

                            <section>
                                <h3>6. Prohibited Use</h3>
                                <p>
                                    Users must not use Resume-AI for unlawful
                                    activities, unauthorized access, or
                                    activities that may harm the service or
                                    other users.
                                </p>
                            </section>

                            <section>
                                <h3>7. Changes to Terms</h3>
                                <p>
                                    We may update these Terms and Conditions
                                    when necessary. Users are responsible for
                                    reviewing any changes.
                                </p>
                            </section>

                        </div>

                        <button
                            type="button"
                            className="terms-close-btn"
                            onClick={() => setShowTerms(false)}
                        >
                            Close
                        </button>

                    </div>

                </Modal>
            )}

        </Modal>
    )
}

export default Register