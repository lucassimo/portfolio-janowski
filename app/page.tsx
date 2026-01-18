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
      'chat.placeholder': 'Ask about experience...',
      'chat.send': 'Send',
      'match.title': 'Job Match Check',
      'match.subtitle': 'Paste a job description and I\'ll assess the fit',
      'match.placeholder': 'Paste job description here...',
      'match.analyze': 'Analyze Match',
      'match.analyzing': 'Analyzing...',
      'quick.biggest': 'Project?',
      'quick.sox': 'SOX?',
      'quick.tools': 'Tools?'
    },
    pl: {
      'hero.title': 'Finanse • Controlling • Strategia',
      'hero.subtitle': 'Senior analityk z 12+ lat doświadczenia w FP&A, finansach nieruchomości i integracji M&A w Credit Suisse, UBS i Citi',
      'chat.title': 'Zapytaj o cokolwiek',
      'chat.placeholder': 'Zapytaj o projekty...',
      'chat.send': 'Wyślij',
      'match.title': 'Sprawdź Dopasowanie',
      'match.subtitle': 'Wklej opis stanowiska - ocenię dopasowanie',
      'match.placeholder': 'Wklej opis stanowiska tutaj...',
      'match.analyze': 'Analizuj',
      'match.analyzing': 'Analizuję...',
      'quick.biggest': 'Projekt?',
      'quick.sox': 'SOX?',
      'quick.tools': 'Narzędzia?'
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
    if (lowerAnalysis.includes('strong match')) return { color: '#22c55e', emoji: '🟢', text: lang === 'en' ? "Nailed It! Great Fit." : "Trafione! Świetne dopasowanie." };
    if (lowerAnalysis.includes('partial match')) return { color: '#f59e0b', emoji: '🟡', text: lang === 'en' ? "Not Perfect, But Let's Talk!" : "Nie idealne, ale pogadajmy!" };
    if (lowerAnalysis.includes('weak match')) return { color: '#f97316', emoji: '🟠', text: lang === 'en' ? "Might Need Some Tweaks." : "Może wymagać dopasowania." };
    if (lowerAnalysis.includes('no match')) return { color: '#ef4444', emoji: '🔴', text: lang === 'en' ? "Not for Me Right Now." : "To nie dla mnie." };
    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    setMessages(prev => [...prev, { text: text.trim(), isUser: true }]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })), { role: 'user', content: text }]
        })
      });
      const data = await response.json();
      setIsTyping(false);

      if (data.error) {
        const isRateLimit = data.error.toLowerCase().includes('rate limit');
        const errorMsg = isRateLimit 
          ? (lang === 'pl' ? "Osiągnięto limit zapytań AI. Spróbuj ponownie za chwilę lub napisz do mnie na LinkedIn!" : "AI rate limit reached. Please try again in a moment or reach out via LinkedIn!")
          : (lang === 'pl' ? "Wystąpił błąd. Spróbuj ponownie." : "Something went wrong. Please try again.");
        setMessages(prev => [...prev, { text: errorMsg, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { text: data.message, isUser: false }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: lang === 'pl' ? 'Błąd połączenia.' : 'Connection failed.', isUser: false }]);
    } finally {
      setIsSending(false);
    }
  };

  const analyzeJob = async () => {
    if (!jobDescription.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setMatchResult(null);

    const prompt = lang === 'pl' 
      ? `Oceń moje dopasowanie. Na samym początku napisz obowiązkowo: "**Fit Assessment:** [Strong Match / Partial Match / Weak Match / No Match]". Potem dodaj szczegółową analizę po polsku:\n\n${jobDescription}`
      : `Assess my fit. Start with: "**Fit Assessment:** [Strong Match / Partial Match / Weak Match / No Match]". Then add detailed analysis in English:\n\n${jobDescription}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });

      const data = await response.json();
      
      if (data.error) {
        const isRateLimit = data.error.toLowerCase().includes('rate limit');
        const errorMsg = isRateLimit 
          ? (lang === 'pl' ? "Limit analiz AI wyczerpany. Spróbuj ponownie za 20 min." : "AI Analysis limit reached. Try again in 20 min.")
          : (lang === 'pl' ? "Błąd analizy." : "Analysis failed.");
        setMatchResult({ error: errorMsg });
      } else {
        setMatchResult({ analysis: data.message });
      }
    } catch (error) {
      setMatchResult({ error: lang === 'pl' ? 'Błąd połączenia.' : 'Connection failed.' });
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
        body { font-family: var(--body); background: var(--bg); color: var(--text); line-height: 1.5; }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet" />

      <div className="container">
        <header className="header">
          <a href="#" className="logo">Łukasz Janowski</a>
          <div className="header-actions">
            <a href="www.linkedin.com/in/lukaszjanowskifcca" target="_blank" className="nav-link">LinkedIn</a>
            <div className="lang-switcher">
              <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
              <button onClick={() => setLang('pl')} className={lang === 'pl' ? 'active' : ''}>PL</button>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-content">
            <h1>{T[lang]['hero.title']}</h1>
            <p className="subtitle">{T[lang]['hero.subtitle']}</p>
            <div className="tag-cloud">
              <span className="tag highlight">FCCA</span>
              <span className="tag">Credit Suisse</span>
              <span className="tag">UBS</span>
              <span className="tag">Citi</span>
            </div>
          </div>

          <div className="chat-window">
            <div className="chat-header">
              <div className="dots">
                <span style={{background: 'var(--accent-coral)'}}></span>
                <span style={{background: 'var(--accent-yellow)'}}></span>
                <span style={{background: 'var(--accent-green)'}}></span>
              </div>
              <span className="chat-title">{T[lang]['chat.title']}</span>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.isUser ? 'user' : 'bot'}`}>{msg.text}</div>
              ))}
              {isTyping && (
                <div className="message bot typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="input-row">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                  placeholder={T[lang]['chat.placeholder']}
                  disabled={isSending}
                />
                <button onClick={() => sendMessage(inputValue)} disabled={isSending || !inputValue.trim()}>
                  {T[lang]['chat.send']}
                </button>
              </div>
              <div className="quick-replies">
                <button onClick={() => sendMessage(T[lang]['quick.biggest'])}>{T[lang]['quick.biggest']}</button>
                <button onClick={() => sendMessage(T[lang]['quick.sox'])}>{T[lang]['quick.sox']}</button>
                <button onClick={() => sendMessage(T[lang]['quick.tools'])}>{T[lang]['quick.tools']}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="match-section">
          <div className="match-card">
            <div className="match-info">
              <h2>{T[lang]['match.title']}</h2>
              <p>{T[lang]['match.subtitle']}</p>
              <div className="match-features">
                <span>💡 AI Analysis</span>
                <span>✓ Instant</span>
                <span>📊 Detailed</span>
              </div>
            </div>

            <div className="match-actions">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={T[lang]['match.placeholder']}
                disabled={isAnalyzing}
              />
              <button onClick={analyzeJob} disabled={isAnalyzing || !jobDescription.trim()}>
                {isAnalyzing ? T[lang]['match.analyzing'] : T[lang]['match.analyze']}
              </button>

              {matchResult && (
                <div className="match-result">
                  {matchResult.error ? (
                    <div className="analysis-text" style={{color: 'var(--accent-coral)', fontWeight: 'bold'}}>{matchResult.error}</div>
                  ) : (
                    <>
                      {matchResult.analysis && getTrafficLight(matchResult.analysis, lang) && (
                        <div className="traffic-light" style={{ borderColor: getTrafficLight(matchResult.analysis, lang)!.color }}>
                          <span className="emoji">{getTrafficLight(matchResult.analysis, lang)!.emoji}</span>
                          <div>
                            <div className="fit-status" style={{ color: getTrafficLight(matchResult.analysis, lang)!.color }}>Assessment</div>
                            <div className="fit-text">{getTrafficLight(matchResult.analysis, lang)!.text}</div>
                          </div>
                        </div>
                      )}
                      <div className="analysis-text">{matchResult.analysis}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="footer">
            <p>© 2026 Łukasz Janowski • No frontend devs were harmed • Just one FCCA + AI</p>
          <div className="footer-links">
            <a href="www.linkedin.com/in/lukaszjanowskifcca">LinkedIn</a>
            <a href="mailto:contact@janowski.biz">Email</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; }
        .logo { font-family: var(--display); font-weight: 800; text-decoration: none; color: var(--text); font-size: 1.2rem; }
        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .nav-link { text-decoration: none; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
        .lang-switcher { display: flex; background: #fff; border: 2px solid var(--border); border-radius: 100px; overflow: hidden; }
        .lang-switcher button { border: none; background: none; padding: 0.4rem 0.7rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
        .lang-switcher button.active { background: var(--text); color: #fff; }

        .hero { display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; padding: 2rem 0 4rem; align-items: start; }
        h1 { font-family: var(--display); font-size: clamp(2.2rem, 5vw, 3.5rem); line-height: 1.1; margin-bottom: 1rem; }
        .subtitle { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2rem; max-width: 450px; }
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag { background: #fff; border: 2px solid var(--border); padding: 0.4rem 0.8rem; border-radius: 100px; font-size: 0.8rem; font-weight: 500; opacity: 0; animation: tagIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .tag:nth-child(1) { animation-delay: 0.1s; }
        .tag:nth-child(2) { animation-delay: 0.15s; }
        .tag:nth-child(3) { animation-delay: 0.2s; }
        .tag:nth-child(4) { animation-delay: 0.25s; }
        .tag:nth-child(5) { animation-delay: 0.3s; }
        .tag.highlight { background: var(--accent-yellow); border-color: var(--text); }

        @keyframes tagIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

        .chat-window { background: #fff; border: 3px solid var(--text); border-radius: 20px; box-shadow: 6px 6px 0 var(--text); overflow: hidden; }
        .chat-header { background: var(--text); color: #fff; padding: 0.75rem 1.25rem; display: flex; align-items: center; justify-content: space-between; }
        .dots { display: flex; gap: 5px; }
        .dots span { width: 10px; height: 10px; border-radius: 50%; }
        .chat-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .chat-messages { height: 350px; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; background: #fafafa; }
        
        .message { max-width: 85%; padding: 0.75rem 1rem; border-radius: 15px; font-size: 0.9rem; line-height: 1.4; word-wrap: break-word; }
        .message.user { align-self: flex-end; background: var(--text); color: #fff; }
        .message.bot { align-self: flex-start; background: #fff; border: 2px solid var(--border); }
        
        .message.bot.typing { display: flex; gap: 4px; padding: 0.8rem 1.2rem; }
        .typing-dot { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: typingBounce 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }

        .chat-input-area { padding: 1rem; border-top: 2px solid var(--border); background: #fff; }
        .input-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
        .input-row input { flex: 1; padding: 0.75rem; border: 2px solid var(--border); border-radius: 10px; outline: none; }
        .input-row button { background: var(--accent-yellow); border: 2px solid var(--text); padding: 0 1rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .quick-replies { display: flex; gap: 0.4rem; overflow-x: auto; scrollbar-width: none; }
        .quick-replies button { white-space: nowrap; background: #fff; border: 2px solid var(--border); padding: 0.4rem 0.8rem; border-radius: 100px; font-size: 0.75rem; cursor: pointer; }

        .match-section { padding: 2rem 0 5rem; }
        .match-card { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2.5rem; background: #fff; border: 3px solid var(--text); padding: 2.5rem; border-radius: 24px; box-shadow: 8px 8px 0 var(--text); }
        .match-actions textarea { width: 100%; height: 150px; padding: 1rem; border: 2px solid var(--border); border-radius: 12px; margin-bottom: 1rem; resize: none; font-family: inherit; }
        .match-actions button { background: var(--text); color: #fff; padding: 0.8rem 1.5rem; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .match-actions button:hover { transform: translateY(-2px); }
        .match-result { margin-top: 1.5rem; padding: 1.25rem; background: var(--bg); border-radius: 12px; animation: slideInResult 0.5s ease-out; }
        .traffic-light { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #fff; border: 2px solid; border-radius: 10px; margin-bottom: 1rem; }
        .fit-status { font-weight: 800; font-family: var(--display); text-transform: uppercase; font-size: 0.8rem; }
        .analysis-text { white-space: pre-wrap; font-size: 0.95rem; }

        @keyframes slideInResult { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 850px) {
          .hero, .match-card { grid-template-columns: 1fr; gap: 2rem; }
          .hero-content { text-align: center; }
          .subtitle { margin: 0 auto 2rem; }
          .tag-cloud { justify-content: center; }
        }
      `}</style>
    </>
  );
}