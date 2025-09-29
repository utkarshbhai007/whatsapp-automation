import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function WhatsAppSender() {
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState(`New Launch – LT504, Vagator✨

Your perfect 5 BHK villa with a private pool in the heart of Goa! 🌴
Spacious interiors, chic modern design, and a full-time chef & caretaker for a seamless stay.

📍 Vagator, Goa
🏡 5 BHK | 🏊 Private Pool | 👨‍🍳 Chef & Caretaker

📲 Book now with Lost Traveller Villas`);

  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('ready');

  const startSending = async () => {
    if (!numbers.trim()) {
      alert('Please enter phone numbers');
      return;
    }

    const numbersArray = numbers.split('\n')
      .filter(num => num.trim())
      .map(num => num.trim());

    setIsSending(true);
    setLogs(['🚀 Starting WhatsApp sending process...']);

    try {
      const response = await axios.post(`${API_BASE}/send-messages`, {
        numbers: numbersArray,
        message: message
      });

      setLogs(prev => [...prev, '✅ Sending process started in background']);
      setStatus('sending');
      
      // Start polling for logs
      pollLogs();
      
    } catch (error) {
      setLogs(prev => [...prev, `❌ Error: ${error.response?.data?.detail || error.message}`]);
      setIsSending(false);
    }
  };

  const pollLogs = async () => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/logs`);
        if (response.data.logs) {
          setLogs(response.data.logs);
        }
        
        // Check if sending is complete
        const lastLog = response.data.logs[response.data.logs.length - 1];
        if (lastLog && lastLog.includes('🎉 Process finished!')) {
          clearInterval(interval);
          setIsSending(false);
          setStatus('completed');
        }
        
      } catch (error) {
        console.error('Error polling logs:', error);
        // If backend is not reachable, stop polling
        clearInterval(interval);
        setIsSending(false);
      }
    }, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('ready');
  };

  // Add basic styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    mainTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #25D366, #128C7E)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    inputContainer: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '2rem',
      border: '1px solid #334155'
    },
    textarea: {
      width: '100%',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      color: 'white',
      resize: 'vertical'
    },
    button: {
      flex: 1,
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    buttonDisabled: {
      flex: 1,
      backgroundColor: '#475569',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>
            🤖 WhatsApp Auto Sender
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
            Automated WhatsApp messaging for property promotions
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Left Column - Inputs */}
          <div style={styles.inputContainer}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              📋 Configuration
            </h2>

            {/* Phone Numbers */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#e2e8f0'
              }}>
                Phone Numbers (one per line):
              </label>
              <textarea
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder="+919876543210&#10;+919876543211&#10;+919876543212"
                rows="8"
                style={styles.textarea}
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Format: +91XXXXXXXXXX (international format)
              </p>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#e2e8f0'
              }}>
                Property Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="10"
                style={styles.textarea}
              />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={startSending}
                disabled={isSending}
                style={isSending ? styles.buttonDisabled : styles.button}
              >
                {isSending ? '🔄 Sending...' : '🚀 Start Sending'}
              </button>
              
              <button
                onClick={clearLogs}
                style={{
                  backgroundColor: '#475569',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🧹 Clear
              </button>
            </div>
          </div>

          {/* Right Column - Logs */}
          <div style={{ 
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #334155',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                📊 Live Logs
              </h2>
              <div style={{ 
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 
                  status === 'ready' ? '#374151' :
                  status === 'sending' ? '#f59e0b' :
                  status === 'completed' ? '#10b981' : '#374151',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {status.toUpperCase()}
              </div>
            </div>

            <div style={{ 
              flex: 1,
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '1rem',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>
                  No logs yet. Enter numbers and click "Start Sending"
                </div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '4px 0',
                      borderBottom: index < logs.length - 1 ? '1px solid #1e293b' : 'none',
                      color: 
                        log.includes('❌') ? '#ef4444' :
                        log.includes('✅') ? '#10b981' :
                        log.includes('⚠️') ? '#f59e0b' :
                        log.includes('🎉') ? '#10b981' : '#e2e8f0'
                    }}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0' }}>
            📝 Instructions:
          </h3>
          <ol style={{ color: '#94a3b8', paddingLeft: '1.5rem' }}>
            <li>Make sure WhatsApp Web is logged in on Chrome</li>
            <li>Enter phone numbers (international format: +91XXXXXXXXXX)</li>
            <li>Review your message</li>
            <li>Click "Start Sending" - the script will run automatically</li>
            <li>Monitor progress in the Live Logs panel</li>
            <li>Don't use mouse/keyboard while script is running</li>
          </ol>
          
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            <strong>⚠️ Important:</strong> This is for personal use only. Use responsibly and comply with WhatsApp's terms of service.
          </div>
        </div>
      </div>
    </div>
  );
}