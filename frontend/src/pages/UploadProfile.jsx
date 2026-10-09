import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import "./Upload.css"
import Modal from '../components/Modal'
function UploadProfile({onClose,onSaveSuccess}) {
    const [file, setFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const handleFile = (e) => {
        setFile(e.target.files[0])
    }
    const clearFile = () => setFile(null)
    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDrageLeave = () => setIsDragging(false)
    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const droped = e.dataTransfer.files[0]
        if (droped?.type.startsWith('image/')) {
            setFile(droped)
        }else{
            console.log("Image Only")
        }
    }
    const handleUpload = async(e) => {
        if(!file){
            console.log("Please Select File")
            return
        }
        const formData = new FormData()
        formData.append("file",file)
        const token = localStorage.getItem('token')
        try{
            const response = await axios.patch('http://localhost:3000/api/users/me/profile-image',formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log("Upload Success",response.data)
            onClose()
            onSaveSuccess()
        }catch(error){
            console.error("Upload Error:",error.message)
        }
    }
  return (
    <Modal onClose={onClose}>
        <h2 className='upload-title'>Upload Profile</h2>
        <p className='upload-subtitle'>Image only · Max file size 5MB</p>
        {!file && (
            <label className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDrageLeave}
                onDrop={handleDrop}>
                <input type="file" onChange={handleFile} hidden/>
                <i className="ti ti-cloud-upload drop-icon"></i>
                <p className='drop-text'>Drag & drop your file here</p>
                <p className='drop-sub'>or click to browse files</p>
            </label>
        )}
        {file && (
            <div className="file-selected">
                <i className='ti ti-file-type-pdf file-icon'></i>
                <div className="file-info">
                    <span className='file-name'>{file.name}</span>
                    <span className='file-size'>{(file.size /1024 /1024).toFixed(1)} MB</span>
                </div>
                <button className='clear-btn' onClick={clearFile}>
                    <i className='ti ti-x'></i>Clear
                </button>
            </div>
        )}
        <button className='upload-btn' onClick={handleUpload} disabled={!file}>
            <i className='ti ti-upload'></i>Upload Profile
        </button>
       
    </Modal>
  )
}

export default UploadProfile
