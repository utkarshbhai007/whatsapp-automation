# WhatsApp Automation

Automated WhatsApp messaging for property promotions using Python and Next.js.

## Features
- Send WhatsApp messages with images to multiple numbers
- Real-time logging and progress tracking
- Web interface for easy configuration
- CORS-enabled API for frontend-backend communication

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:3000

### Python Script Dependencies
```bash
cd python-script
pip install -r requirements.txt
```

## Deployment

### Backend (Railway/Render)
1. Push the `backend/` folder to a Git repository
2. Deploy to Railway or Render
3. Set environment variables if needed
4. Note the deployed URL (e.g., https://your-app.onrender.com)

### Frontend (Vercel)
1. Push the `frontend/` folder to a Git repository
2. Deploy to Vercel
3. In Vercel dashboard, set environment variable:
   - `NEXT_PUBLIC_API_BASE` = your backend URL (e.g., https://your-app.onrender.com)
4. Redeploy

### Usage
1. Ensure WhatsApp Web is logged in on Chrome
2. Enter phone numbers (one per line, international format: +91XXXXXXXXXX)
3. Enter your message
4. Click "Start Sending"
5. Monitor progress in Live Logs

## Important Notes
- This is for personal use only
- Comply with WhatsApp's terms of service
- Don't use mouse/keyboard while script is running
- Requires Chrome with WhatsApp Web logged in

## Dependencies
- Backend: FastAPI, Uvicorn
- Frontend: Next.js, React
- Automation: PyWhatKit, PyAutoGUI, PyWin32
