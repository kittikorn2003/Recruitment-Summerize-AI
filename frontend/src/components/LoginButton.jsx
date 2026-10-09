import React from 'react'
import "../components/LoginButton.css"
function LoginButton({ label,onClick,type="button"}) {
  return (
    <div>
        <button type={type} onClick={onClick} className="primary-btn">
            {label}
        </button>
    </div>
  )
}

export default LoginButton
