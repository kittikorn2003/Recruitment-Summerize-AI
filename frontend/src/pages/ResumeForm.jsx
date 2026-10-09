import React from 'react'
import Modal from '../components/Modal'
import { useState } from 'react'
import "./ResumeForm.css"
import axios from 'axios'

function ResumeForm({ onClose,initialData,onSaveSuccess }) {
    // console.log("this is Resume",initialData)
    const [formData, setFormData] = useState(initialData);
    const [newSkill, setNewSkill] = useState('');
    const [newSpokenLanguages, setNewSpokenLanguages] = useState('');
    
    const handlePersonalChang = (e) => {
        const {name,value} = e.target;
        setFormData({
            ...formData ,
            personal_info:{
                ...formData.personal_info,[name]:value
            }
        })
    }

    const handleTopLevelChange = (e) => {
        const{name,value} = e.target;
        setFormData({...formData,[name]:value})
    }

    const handelEducationChange = (index, field, value) => {
        const updated  = [...formData.education];
        updated [index] = { ...updated[index],[field]:value}
        setFormData({ ...formData,education:updated });
    }

    const addEducation = () => {
        setFormData({...formData,education:[...(formData.education || []), {degree: '',institution: '',year: ''}]
        })
    }

    const removeEducation = (index) => {
        const updated = formData.education.filter((_, i) => i !== index)
        setFormData({...formData,education:updated})
    }

    const removeSkill = (index) => {
        const updated = formData.skills.filter((_,i) => i !== index )
        setFormData({...formData,skills:updated})
    }
    const addSkill = () => {
        if (!newSkill.trim()) return
        setFormData({...formData, skills:[...(formData.skills || []), newSkill.trim()] })
        setNewSkill('')
    }
    const addSpokenLanguages = () => {
        if (!newSpokenLanguages.trim()) return
        setFormData({...formData, spoken_languages:[...(formData.spoken_languages || []), newSpokenLanguages.trim()] })
        setNewSpokenLanguages('')
    }
    const removeSpokenLanguages = (index) => {
        const updated = formData.spoken_languages.filter((_,i) => i !== index )
        setFormData({...formData,spoken_languages:updated})
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token')
        try {
            const response = await axios.post('http://localhost:3000/api/resumes',formData, {
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            })
            if (response.data.success){
                console.log("Save suscess",response.data)
            }
            onSaveSuccess();
            onClose();
        }catch(error){
            console.error("Save Error",error.message)
        }
    }
  return (
    <Modal onClose={onClose} className='modal-lg'>
        <form className='rf-form' onSubmit={handleSubmit}>
            <div className='rf-header'>
                <div>
                    <p className='rf-header-sub'>Resume</p>
                    <h2 className='rf-header-title'>Personal info</h2>
                </div>
            </div>
            <div className='rf-body'>
                <section className="rf-section">
                    <p className='rf-section-label'>Contact</p>
                    <div className='rf-field'>
                        <label className='rf-label'>Fullname</label>
                        <input className='rf-input' type="text" name='full_name'
                            value={formData?.personal_info?.full_name || ''}
                            onChange={handlePersonalChang}/>
                    </div>
                    <div className='rf-row'>
                        <div className="rf-field">
                            <label className='rf-label'>Email</label>
                            <input className='rf-input' type="text" name='email'
                                value={formData?.personal_info?.email || ''}
                                onChange={handlePersonalChang}/>
                        </div>
                        <div className='rf-field'>
                            <label className='rf-label'>Address</label>
                            <input className='rf-input' type="text" name='address'
                                value={formData?.personal_info?.address || ''}
                                onChange={handlePersonalChang}/>
                        </div>
                    </div>
                </section>
                <section>
                    <p className='rf-section-label'>Career Summary</p>
                    <textarea className='rf-textarea' name='career_summary' rows={3}
                        placeholder='Brief overview of your professional background...' 
                        value={formData?.career_summary || ''} 
                        onChange={handleTopLevelChange}/>
                </section>
                <section>
                    <div className='rf-section-header'>
                        <p className='rf-section-label'>Educations</p>
                        <button type='button' className='rf-add-btn' onClick={addEducation}>+ Add</button>
                    </div>
                        <div className="rf-list">
                            {formData?.education?.map((edu, index) => (
                                <div key={index} className='rf-card'>
                                    <button type='button' className='rf-remove-btn' onClick={() => removeEducation(index)}>✕</button>
                                    <div className="rf-row">
                                        <div className="rf-field">
                                            <label className='rf-label'>Degree</label>
                                            <input
                                                type="text" placeholder="Degree" className='rf-input'
                                                value={edu.degree || ''}
                                                onChange={(e) => { handelEducationChange(index,'degree',e.target.value)}}
                                            />
                                        </div>
                                        <div className="rf-field">
                                            <label className='rf-label'>Institution</label>
                                            <input
                                                type="text" placeholder="University / Institution" className='rf-input'
                                                value={edu.institution || ''}
                                                onChange={(e) => { handelEducationChange(index,'institution',e.target.value)}}
                                            />
                                        </div>
                                        <div className="rf-field" style={{ maxWidth: '140px'}}>
                                            <label className='rf-label'>Year</label>
                                            <input
                                                type="text" placeholder="Year" className='rf-input'
                                                value={edu.year || ''}
                                                onChange={(e) => { handelEducationChange(index,'year',e.target.value)}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                </section>

                {/* <div>
                    <h3>Employment History</h3>
                    {formData?.employment_history?.map((emp, index) => (
                        <div key={index}>
                                <h4>Position</h4>
                            <input
                                type="text"
                                placeholder="Position"
                                value={emp.position || ''}
                                onChange={(e) => {
                                    const updateEmployment = [...formData.employment_history];
                                    updateEmployment[index].position = e.target.value;
                                    setFormData({...formData,employment_history:updateEmployment});
                                }}
                            />
                                <h4>Organization</h4>
                            <input
                                type="text"
                                placeholder="Organization"
                                value={emp.organization || ''}
                                onChange={(e) => {
                                    const updateEmployment = [...formData.employment_history];
                                    updateEmployment[index].organization = e.target.value;
                                    setFormData({...formData,employment_history:updateEmployment});
                                }}
                            />
                        </div>
                    ))}
                </div> */}
                <section className="rf-section">
                    <div className='rf-section-header'>
                        <p className='rf-section-label'>Skills</p>
                    </div>
                    <div className='rf-skills'>
                        {formData?.skills?.map((skill, index) => (
                            <div key={index} className="rf-skill-tag">
                                <span>{skill}</span>
                                <button type='button' className='rf-skill-remove' onClick={() => removeSkill(index)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div className="rf-skill-input-row">
                        <input type="text" className="rf-input" placeholder='Add a skill...'
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(),addSkill())}
                        />
                        <button type='button' className="rf-add-btn" onClick={addSkill}>+ Add</button>
                    </div>
                    
                </section>
                <section className="rf-section">
                    <div className='rf-section-header'>
                        <p className='rf-section-label'>Spoken Languages</p>
                    </div>
                    <div className='rf-skills'>
                        {formData?.spoken_languages?.map((spoken_languages, index) => (
                            <div key={index} className="rf-skill-tag">
                                <span>{spoken_languages}</span>
                                <button type='button' className='rf-skill-remove' onClick={() => removeSpokenLanguages(index)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div className="rf-skill-input-row">
                        <input type="text" className="rf-input" placeholder='Add a skill...'
                            value={newSpokenLanguages}
                            onChange={(e) => setNewSpokenLanguages(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(),addSpokenLanguages())}
                        />
                        <button type='button' className="rf-add-btn" onClick={addSpokenLanguages}>+ Add</button>
                    </div>
                    
                </section>
            </div>   

            <div className="rf-footer">
                <button type="button" className='rf-btn-cancel' onClick={onClose}>Cancel</button>
                <button type='submit' className='rf-btn-save'>Save</button>
            </div>
        </form>
    </Modal>
  )
}

export default ResumeForm
