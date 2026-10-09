# AI Resume Platform – Definition of Done (DOD)

# Project Goal

AI Resume Platform สำหรับ:
- Applicant upload resume
- Recruiter search candidate
- AI ช่วย parse และ summarize resume
- รองรับ hybrid search ในอนาคต

---

# Tech Stack

## Frontend
- React

## Backend
- Node.js
- Express.js

## Database
- PostgreSQL

## Future AI
- OpenAI API
- pgvector

---

# Sprint 1 – Backend Foundation + Auth + Resume Upload API

## Goal
สร้าง backend foundation และระบบ authentication พร้อม resume upload API

---

## Features

### Authentication
- Register
- Login
- JWT Authentication
- Protected Route

### Resume Upload
- Upload PDF
- Save file
- Save record ลง database

---

# APIs

## Auth APIs
POST /api/register

POST /api/login

GET /api/me

---

## Resume APIs
POST /api/resume/upload

GET /api/resume/:id

---

# Database

## users
- id
- email
- password
- role
- created_at

## resumes
- id
- user_id
- file_url
- created_at

---

# Definition of Done

## Authentication
- [x] Register API ใช้งานได้
- [x] Login API ใช้งานได้
- [x] Password hash ด้วย bcrypt
- [x] JWT Authentication ใช้งานได้

---

## Resume Upload
- [x] Upload PDF ได้
- [x] Save file ลง storage/server ได้
- [x] Save record ลง database ได้
- [x] รองรับเฉพาะไฟล์ PDF

---

## Backend Structure
- [x] แยก route/controller/service ได้
- [x] เชื่อม PostgreSQL สำเร็จ
- [x] ใช้งาน environment variables ได้
- [x] Error handling เบื้องต้นใช้งานได้

---

# Sprint 2 – Frontend Auth + Resume Upload

## Goal
สร้าง frontend สำหรับ authentication และ upload resume

---

# Features

## Authentication UI
- Register Page
- Login Page
- Protected Route

## Resume Upload UI
- Upload Resume Page
- Upload Status
- Error Message

---

# Pages

- /register
- /login
- /upload

---

# Frontend State

## Auth
- JWT token
- login state

## Resume
- selected file
- upload status

---

# Definition of Done

## Authentication UI
- [x] Register form ใช้งานได้
- [x] Login form ใช้งานได้
- [x] เก็บ JWT token ได้

---

## Resume Upload UI
- [x] Upload PDF ผ่าน frontend ได้
- [x] เชื่อม API upload สำเร็จ
- [x] แสดง success/error message ได้

---

## Frontend Structure
- [x] แยก component ได้เหมาะสม
- [x] ใช้งาน React hooks ได้ถูกต้อง
- [x] แยก API call ออกจาก UI ได้

---

# Sprint 3 – Candidate Search UI + Candidate API

## Goal
สร้าง recruiter interface สำหรับค้นหา candidate

---

# Features

## Frontend
- Search bar
- Candidate list
- Candidate card
- Filter sidebar
- Responsive layout

## Backend
- Candidate list API
- Search API
- Candidate detail API

---

# APIs

GET /api/candidates

GET /api/candidates/search?q=react

GET /api/candidates/:id

---

# Database

## candidates
- id
- user_id
- full_name
- title
- experience_years
- location
- summary
- created_at

## candidate_languages
- candidate_id
- language

---

# UI Components

- Navbar
- SearchBar
- FilterSidebar
- CandidateCard
- CandidateList

---

# Definition of Done

## Frontend
- [x] Search page แสดง candidate ได้
- [x] Candidate card UI เสร็จ
- [x] Responsive layout ใช้งานได้


---

## Backend
- [x] ดึง candidate list ได้
- [x] Search candidate ได้
- [x] ส่งข้อมูล candidate ให้ frontend ได้

---

## Integration
- [x] Frontend เชื่อม backend สำเร็จ

---

# Sprint 4 – Hybrid Search Backend + AI Preparation

## Goal
สร้าง foundation สำหรับ AI-powered search

---

# Features

## Resume Processing
- Extract text จาก PDF
- Generate embedding
- Save embedding ลง database

## Hybrid Search
- Keyword Search
- Semantic Search
- Ranking candidate

---

# Search Flow

User Search
↓
Keyword Match
↓
Embedding Similarity
↓
Combine Score
↓
Return Ranked Candidates

---

# APIs

POST /api/resume/parse

POST /api/embedding/generate

GET /api/search?q=frontend+react

---

# Database

## resume_chunks
- id
- resume_id
- content
- embedding

---

# Tech Suggestions

## PDF Parsing
- pdf-parse

## Vector Search
- pgvector

## Embedding
- OpenAI Embedding API

---

# Definition of Done

## Resume Processing
- [ ] Extract text จาก PDF ได้
- [ ] Generate embedding ได้
- [ ] Save embedding ลง database ได้

---

## Hybrid Search
- [ ] Search แบบ keyword ได้
- [ ] Search แบบ semantic ได้
- [ ] Ranking candidates ได้

---

## Performance
- [ ] Search response < 2 sec
- [ ] รองรับ candidate หลักร้อยได้

---

# Current Architecture

Frontend (React)
↓
Backend API (Node.js / Express)
↓
PostgreSQL

---

# Future Architecture

Frontend
↓
Backend API
↓
PostgreSQL + pgvector
↓
OpenAI API