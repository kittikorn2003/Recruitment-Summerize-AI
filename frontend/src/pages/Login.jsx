import React from 'react'
import { useState } from 'react'
import "../pages/AuthForm.css"
import axios from 'axios';
import LoginButton from '../components/LoginButton';
import Modal from '../components/Modal';


function Login({onClose,onLoginSuccess,onSwitchToSingUp}) {
    // สร้าง state สำหรับสำหรับเก็บค่า user พิมพ์ (เปรียบเหมือนตัวแปรในหน้าเว็ป)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // function นี้จะทำงานเมื่อ user กดปุ่ม "Login"
    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await axios.post('http://localhost:3000/api/auth/login',{
          username:username,
          password:password
        });
        localStorage.setItem('token', response.data.token);
        onLoginSuccess(response.data.user)
        console.log('Login Success',response.data)
        onClose();
      } catch (error) {
        if(error.response){
          console.error('Server Error:',error.response.data)
        }else{
          console.error('Network Error:',error.message)
        }
      }
    }
  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className='auth-form'>
        <h2>LOGIN</h2>
        <div>
          <label>Username/Email:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='example@gmail.com' />
        </div>
        <br />
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <LoginButton label="Login" type="submit"/>
        <span className='link-text'>Don't have an account? </span>
         <button type="button" className='link-btn' onClick={onSwitchToSingUp}>SignUp here</button>
      </form>
    </Modal>
  );
}

export default Login
