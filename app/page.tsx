'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [lang, setLang] = useState<'en' | 'pl'>('en');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const T: Record<string, Record<string, string>> = {
    en: {
      'hero.title': 'Finance • Controlling • Strategy',
      'hero.subtitle': 'Senior analyst with 12+ years experience in FP&A, real estate finance, and M&A integration at Credit Suisse, UBS, and Citi',
      'chat.title': 'Ask me anything',
      'chat.placeholder': 'Ask about my experience, projects, or skills...',
      'chat.send': 'Send',
      'match.title': 'Job Match Check',
      'match.subtitle': 'Paste a job description and I\'ll assess the fit',
      'match.placeholder': 'Paste job description here...',
      'match.analyze': 'Analyze Match',
      'match.analyzing': 'Analyzing...',
      'quick.biggest': 'Biggest project?',
      'quick.sox': 'SOX experience?',
      'quick.tools': 'What tools?'
    },
    pl: {
      'hero.title': 'Finanse • Controlling • Strategia',
      'hero.subtitle': 'Senior analityk z 12+ lat doświadczenia w FP&A, finansach nieruchomości i integracji M&A w Credit Suisse, UBS i Citi',
      'chat.title': 'Zapytaj o cokolwiek',
      'chat.placeholder': 'Zapytaj o doświadczenie, projekty lub umiejętności...',
      'chat.send': 'Wyślij',
      'match.title': 'Sprawdź Dopasowanie',
      'match.subtitle': 'Wklej opis stanowiska - ocenię dopasowanie',
      'match.placeholder': 'Wklej opis stanowiska tutaj...',
      'match.analyze': 'Analizuj',
      'match.analyzing': 'Analizuję...',
      'quick.biggest': 'Największy projekt?',
      'quick.sox': 'Doświadczenie SOX?',
      'quick.tools': 'Jakie narzędzia?'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
const getTrafficLight = (analysis: string, lang: 'en' | 'pl') => {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (lowerAnalysis.includes('strong match')) {
    return {
      color: '#22c55e', // green
      emoji: '🟢',
      text: lang === 'en' 
        ? "Nailed It! We're a Great Fit." 
        : "Trafione! Świetne dopasowanie."
    };
  } else if (lowerAnalysis.includes('partial match')) {
    return {
      color: '#f59e0b', // yellow/orange
      emoji: '🟡',
      text: lang === 'en' 
        ? "Not Perfect, But Let's Talk – Could Be Fun!" 
        : "Nie idealne, ale pogadajmy – może być ciekawie!"
    };
  } else if (lowerAnalysis.includes('weak match')) {
    return {
      color: '#f97316', // orange
      emoji: '🟠',
      text: lang === 'en' 
        ? "Hmm, Might Need Some Tweaks – Worth a Chat?" 
        : "Hmm, może wymagać dopasowania – warto porozmawiać?"
    };
  } else if (lowerAnalysis.includes('no match')) {
    return {
      color: '#ef4444', // red
      emoji: '🔴',
      text: lang === 'en' 
        ? "Afraid It's Not for Me Right Now – Keep Searching!" 
        : "Obawiam się, że to nie dla mnie – szukaj dalej!"
    };
  }
  
  // Default - jeśli AI nie użyło standardowych fraz
  return null;
};
  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMessage = text.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.isUser ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.error) {
        setMessages(prev => [...prev, { 
          text: `Error: ${data.error}`, 
          isUser: false 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: data.message, 
          isUser: false 
        }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: 'Sorry, something went wrong. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const analyzeJob = async () => {
    if (!jobDescription.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setMatchResult(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Please assess my fit for this job:\n\n${jobDescription}`
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setMatchResult({ error: data.error });
      } else {
        setMatchResult({ analysis: data.message });
      }
    } catch (error) {
      setMatchResult({ error: 'Analysis failed. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --bg: #f5f0e8;
          --bg-card: #ffffff;
          --text: #1a1a1a;
          --text-muted: #666666;
          --accent-yellow: #ffd60a;
          --accent-green: #34d399;
          --accent-purple: #a78bfa;
          --accent-coral: #ff6b6b;
          --border: #e5e0d8;
          --display: 'Bricolage Grotesque', sans-serif;
          --body: 'Instrument Sans', sans-serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { 
          font-family: var(--body); 
          background: var(--bg); 
          color: var(--text); 
          line-height: 1.6; 
          min-height: 100vh; 
        }
        body::before {
          content: '';
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet" />

      <div className="container">
        {/* Header */}
        <header style={{ padding: '1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="#" style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', textDecoration: 'none' }}>
              Łukasz Janowski
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <a href="https://linkedin.com/in/lukaszjanowski" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
                LinkedIn
              </a>
              <div style={{ display: 'flex', background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setLang('en')}
                  style={{ background: lang === 'en' ? 'var(--text)' : 'transparent', color: lang === 'en' ? 'var(--bg)' : 'var(--text-muted)', border: 'none', padding: '0.4rem 0.8rem', fontFamily: 'var(--body)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('pl')}
                  style={{ background: lang === 'pl' ? 'var(--text)' : 'transparent', color: lang === 'pl' ? 'var(--bg)' : 'var(--text-muted)', border: 'none', padding: '0.4rem 0.8rem', fontFamily: 'var(--body)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  PL
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section style={{ padding: '3rem 0 4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                {T[lang]['hero.title']}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
                {T[lang]['hero.subtitle']}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="tag highlight">FCCA</span>
                <span className="tag highlight">MBA</span>
                <span className="tag">12+ years</span>
                <span className="tag">200M+ CHF</span>
                <span className="tag">21M savings</span>
                <span className="tag">3 banks</span>
              </div>
            </div>

            {/* Chat Container */}
            <div style={{ position: 'relative' }}>
            

              <div style={{ background: 'var(--bg-card)', border: '3px solid var(--text)', borderRadius: '24px', overflow: 'hidden', boxShadow: '8px 8px 0 var(--text)', transition: 'all 0.2s' }}>
                <div style={{ background: 'var(--text)', color: 'var(--bg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-coral)' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-yellow)' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem', marginLeft: 'auto' }}>{T[lang]['chat.title']}</span>
                </div>

                <div style={{ height: '320px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        maxWidth: '85%',
                        padding: '1rem 1.25rem',
                        borderRadius: '18px',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        background: msg.isUser ? 'var(--text)' : 'var(--bg)',
                        color: msg.isUser ? 'var(--bg)' : 'var(--text)',
                        border: msg.isUser ? 'none' : '2px solid var(--border)',
                        alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                        borderBottomLeftRadius: msg.isUser ? '18px' : '4px',
                        borderBottomRightRadius: msg.isUser ? '4px' : '18px',
                        whiteSpace: 'pre-wrap',
                        animation: 'msgPop 0.3s ease-out'
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{ display: 'flex', gap: '4px', padding: '1rem 1.25rem', background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: '18px', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
                      <span style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
                      <span style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '2px solid var(--border)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                      placeholder={T[lang]['chat.placeholder']}
                      disabled={isSending}
                      style={{ flex: 1, background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: '12px', padding: '0.875rem 1rem', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                    <button
                      onClick={() => sendMessage(inputValue)}
                      disabled={isSending || !inputValue.trim()}
                      style={{ background: 'var(--accent-yellow)', color: 'var(--text)', border: '2px solid var(--text)', borderRadius: '12px', padding: '0 1.5rem', fontFamily: 'var(--body)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: (isSending || !inputValue.trim()) ? 0.5 : 1 }}
                    >
                      {T[lang]['chat.send']}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => sendMessage(T[lang]['quick.biggest'])} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontFamily: 'var(--body)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {T[lang]['quick.biggest']}
                    </button>
                    <button onClick={() => sendMessage(T[lang]['quick.sox'])} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontFamily: 'var(--body)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {T[lang]['quick.sox']}
                    </button>
                    <button onClick={() => sendMessage(T[lang]['quick.tools'])} style={{ background: 'var(--bg-card)', border: '2px solid var(--border)', color: 'var(--text)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontFamily: 'var(--body)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {T[lang]['quick.tools']}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Match Section */}
        <section style={{ padding: '4rem 0 6rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '3px solid var(--text)', borderRadius: '24px', padding: '3rem', boxShadow: '8px 8px 0 var(--text)', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                {T[lang]['match.title']}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>
                {T[lang]['match.subtitle']}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: 'var(--accent-yellow)' }}>💡</div>
                  <span>AI-powered analysis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: 'var(--accent-green)' }}>✓</div>
                  <span>Instant feedback</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: 'var(--accent-purple)', color: 'white' }}>📊</div>
                  <span>Detailed assessment</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={T[lang]['match.placeholder']}
                disabled={isAnalyzing}
                style={{ width: '100%', height: '160px', background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: '16px', padding: '1.25rem', color: 'var(--text)', fontFamily: 'var(--body)', fontSize: '0.95rem', resize: 'none', outline: 'none', transition: 'border-color 0.2s' }}
              />
              <button
                onClick={analyzeJob}
                disabled={isAnalyzing || !jobDescription.trim()}
                style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: '12px', padding: '1rem 2rem', fontFamily: 'var(--body)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-start', opacity: (isAnalyzing || !jobDescription.trim()) ? 0.5 : 1 }}
              >
                {isAnalyzing ? T[lang]['match.analyzing'] : T[lang]['match.analyze']}
              </button>

              {matchResult && (
  <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg)', borderRadius: '16px', border: '2px solid var(--border)', animation: 'msgPop 0.4s ease-out' }}>
    {matchResult.error ? (
      <p style={{ color: 'var(--accent-coral)' }}>{matchResult.error}</p>
    ) : (
      <>
        {/* Traffic Light Indicator */}
        {getTrafficLight(matchResult.analysis, lang) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1.5rem', 
            padding: '1rem 1.5rem', 
            background: 'var(--bg-card)', 
            borderRadius: '12px',
            border: `3px solid ${getTrafficLight(matchResult.analysis, lang)!.color}`
          }}>
            <span style={{ fontSize: '2.5rem' }}>
              {getTrafficLight(matchResult.analysis, lang)!.emoji}
            </span>
            <div>
              <div style={{ 
                fontFamily: 'var(--display)', 
                fontWeight: 700, 
                fontSize: '1.1rem',
                color: getTrafficLight(matchResult.analysis, lang)!.color
              }}>
                {matchResult.analysis.match(/\*\*Fit Assessment:\*\*\s*(\w+\s?\w*)/i)?.[1] || 'Assessment'}
              </div>
              <div style={{ 
                fontSize: '0.95rem', 
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                {getTrafficLight(matchResult.analysis, lang)!.text}
              </div>
            </div>
          </div>
        )}
        
        {/* Full Analysis */}
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {matchResult.analysis}
        </div>
      </>
    )}
  </div>
)}
            </div>
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <p>© 2025 Łukasz Janowski • FCCA • Warsaw, Poland</p>
          <p style={{ marginTop: '0.5rem' }}>
            <a href="https://linkedin.com/in/lukaszjanowski" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>LinkedIn</a>
            {' • '}
            <a href="mailto:contact@janowski.biz" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>contact@janowski.biz</a>
          </p>
        </footer>
      </div>

      <style jsx>{`
        .tag {
          background: var(--bg-card);
          border: 2px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          transition: all 0.2s;
          display: inline-block;
        }
        .tag:hover {
          border-color: var(--text);
        }
        .tag.highlight {
          background: var(--accent-yellow);
          border-color: var(--accent-yellow);
          font-weight: 600;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes msgPop {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }

        @media (max-width: 768px) {
          .hero-grid,
          .match-card {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </>
  );
}