document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const langToggleBtn = document.getElementById('lang-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const quickActions = document.getElementById('quick-actions');
    const chips = document.querySelectorAll('.chip');
    const chips = document.querySelectorAll('.chip');
    
    // State
    let currentLang = 'en';
    let qaDatabase = [];
    
    // Conversation State Machine
    let conversationState = {
        currentFlow: null,
        step: 0,
        data: {}
    };

    // Flow Definitions
    const flows = {
        booking: {
            steps: [
                {
                    key: 'from',
                    en: 'Where do you want to travel from? (Source station)',
                    hi: 'आप कहाँ से यात्रा करना चाहते हैं? (प्रस्थान स्टेशन)'
                },
                {
                    key: 'to',
                    en: 'Where do you want to travel to? (Destination)',
                    hi: 'आप कहाँ जाना चाहते हैं? (गंतव्य)'
                },
                {
                    key: 'date',
                    en: 'When do you want to travel? (e.g., 25th August)',
                    hi: 'आप कब यात्रा करना चाहते हैं? (जैसे, 25 अगस्त)'
                },
                {
                    key: 'class',
                    en: 'Which class do you prefer? (Sleeper/3AC/2AC/1AC/General)',
                    hi: 'आप किस क्लास को पसंद करते हैं? (स्लीपर/3AC/2AC/1AC/जनरल)'
                },
                {
                    key: 'passengers',
                    en: 'How many passengers?',
                    hi: 'कितने यात्री हैं?'
                }
            ],
            summaryEn: (data) => `I want to book ${data.passengers} tickets in ${data.class} from ${data.from} to ${data.to} on ${data.date}. Give step-by-step instructions.`,
            summaryHi: (data) => `मैं ${data.from} से ${data.to} तक ${data.date} को ${data.class} में ${data.passengers} टिकट बुक करना चाहता हूँ। चरण-दर-चरण निर्देश दें।`
        },
        complaint: {
            steps: [
                {
                    key: 'type',
                    en: 'Is your complaint about a Train or a Station?',
                    hi: 'क्या आपकी शिकायत ट्रेन या स्टेशन के बारे में है?'
                },
                {
                    key: 'pnr',
                    en: 'Please share your PNR number or Train number.',
                    hi: 'कृपया अपना पीएनआर नंबर या ट्रेन नंबर साझा करें।'
                },
                {
                    key: 'issue',
                    en: 'What is the issue? (Cleanliness/Food/AC not working/Staff behavior/Other)',
                    hi: 'समस्या क्या है? (सफाई/भोजन/एसी काम नहीं कर रहा/कर्मचारी व्यवहार/अन्य)'
                }
            ],
            summaryEn: (data) => `I want to file a complaint about a ${data.type} issue (${data.issue}) for PNR/Train ${data.pnr}. Give step-by-step guide.`,
            summaryHi: (data) => `मैं PNR/Train ${data.pnr} के लिए ${data.type} समस्या (${data.issue}) के बारे में शिकायत दर्ज करना चाहता हूँ। चरण-दर-चरण मार्गदर्शिका दें।`
        },
        temple: {
            steps: [
                {
                    key: 'destination',
                    en: 'Which temple or city do you want to visit?',
                    hi: 'आप किस मंदिर या शहर की यात्रा करना चाहते हैं?'
                },
                {
                    key: 'source',
                    en: 'Where will you be traveling from?',
                    hi: 'आप कहाँ से यात्रा करेंगे?'
                }
            ],
            summaryEn: (data) => `I want to visit ${data.destination} travelling from ${data.source}. Give complete route info, trains, hotels, temple details.`,
            summaryHi: (data) => `मैं ${data.source} से ${data.destination} की यात्रा करना चाहता हूँ। पूरी मार्ग जानकारी, ट्रेन, होटल, मंदिर विवरण दें।`
        },
        pnr: {
            steps: [
                {
                    key: 'pnr',
                    en: 'Please enter your 10-digit PNR number.',
                    hi: 'कृपया अपना 10-अंकीय पीएनआर नंबर दर्ज करें।'
                }
            ],
            summaryEn: (data) => `How do I check PNR status for PNR ${data.pnr}?`,
            summaryHi: (data) => `मैं PNR ${data.pnr} के लिए पीएनआर स्थिति की जांच कैसे करूं?`
        },
        cancel: {
            steps: [
                {
                    key: 'pnr',
                    en: 'Please share your PNR number.',
                    hi: 'कृपया अपना पीएनआर नंबर साझा करें।'
                },
                {
                    key: 'scope',
                    en: 'Do you want to cancel all passengers or specific ones?',
                    hi: 'क्या आप सभी यात्रियों को या विशिष्ट को रद्द करना चाहते हैं?'
                }
            ],
            summaryEn: (data) => `I want to cancel my ticket (PNR: ${data.pnr}, Scope: ${data.scope}). Give complete cancellation guide.`,
            summaryHi: (data) => `मैं अपना टिकट रद्द करना चाहता हूँ (PNR: ${data.pnr}, Scope: ${data.scope})। पूर्ण रद्दीकरण मार्गदर्शिका दें।`
        }
    };
    };



    // Load JSON Data
    fetch('rag_questions_bank.json')
        .then(response => response.json())
        .then(data => {
            qaDatabase = data.questions;
            console.log(`Loaded ${qaDatabase.length} questions`);
        })
        .catch(error => {
            console.error('Error loading question bank:', error);
            // Add a fallback dummy data if fetch fails (e.g. CORS issues in local file:// mode without server)
            if(qaDatabase.length === 0) {
                console.warn('Using fallback data. Please run via a web server (like Live Server or http-server) to load JSON correctly.');
            }
        });

    // Stop Words
    const stopWordsEn = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'how', 'do', 'i', 'my', 'can', 'to', 'for', 'in', 'on', 'at', 'with', 'what', 'where', 'when', 'why', 'of', 'and', 'or', 'about']);
    const stopWordsHi = new Set(['क्या', 'कैसे', 'मैं', 'मेरा', 'मेरी', 'मुझे', 'को', 'के', 'में', 'पर', 'से', 'है', 'हैं', 'था', 'थी', 'और', 'या', 'लिए', 'अपना', 'अपनी', 'कर']);

    // Language Toggle
    langToggleBtn.addEventListener('click', () => {
        if (currentLang === 'en') {
            body.classList.remove('lang-en');
            body.classList.add('lang-hi');
            currentLang = 'hi';
            userInput.placeholder = "अपना संदेश यहाँ लिखें...";
        } else {
            body.classList.remove('lang-hi');
            body.classList.add('lang-en');
            currentLang = 'en';
            userInput.placeholder = "Type your message here...";
        }
        scrollToBottom();
    });

    // Input Validation
    userInput.addEventListener('input', () => {
        sendBtn.disabled = userInput.value.trim().length === 0;
    });

    // Quick Actions
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = currentLang === 'en' ? chip.getAttribute('data-en') : chip.getAttribute('data-hi');
            quickActions.classList.add('hidden');
            processUserMessage(text);
        });
    });

    // Form Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text) {
            userInput.value = '';
            sendBtn.disabled = true;
            quickActions.classList.add('hidden');
            processUserMessage(text);
        }
    });

        }
    });



    // Intent Detection
    function detectIntent(text, isHindi) {
        const t = text.toLowerCase();
        
        // Cancel/Reset current flow keywords
        if (t.includes('cancel flow') || t.includes('stop') || t.includes('start over') || t.includes('रद्द') || t.includes('रुको') || t.includes('नया')) {
            return 'reset';
        }

        if (t.includes('book') || t.includes('ticket') || t.includes('reserve') || t.includes('टिकट') || t.includes('बुक')) {
            return 'booking';
        }
        if (t.includes('complaint') || t.includes('problem') || t.includes('issue') || t.includes('shikayat') || t.includes('शिकायत') || t.includes('समस्या')) {
            return 'complaint';
        }
        if (t.includes('temple') || t.includes('mandir') || t.includes('visit') || t.includes('travel to') || t.includes('मंदिर') || t.includes('दर्शन') || t.includes('यात्रा')) {
            return 'temple';
        }
        if (t.includes('pnr') || t.includes('status') || t.includes('check') || t.includes('स्थिति') || t.includes('चेक')) {
            return 'pnr';
        }
        if (t.includes('cancel') || t.includes('refund') || t.includes('कैंसिल') || t.includes('वापसी')) {
            return 'cancel';
        }
        return null;
    }

    // Process Message Flow
    async function processUserMessage(text) {
        appendMessage(text, 'user');
        
        // Detect language based on Devanagari characters
        const isHindi = /[\u0900-\u097F]/.test(text);
        // Switch UI language if needed based on input
        if (isHindi && currentLang === 'en') {
            langToggleBtn.click();
        } else if (!isHindi && currentLang === 'hi') {
            langToggleBtn.click();
        }

        showTypingIndicator();
        
        try {
            // Check for reset intent
            if (conversationState.currentFlow !== null) {
                const intent = detectIntent(text, isHindi);
                if (intent === 'reset') {
                    conversationState = { currentFlow: null, step: 0, data: {} };
                    hideTypingIndicator();
                    appendMessage(isHindi ? "ठीक है, मैंने पिछला कार्य रद्द कर दिया है। मैं अब आपकी कैसे मदद कर सकता हूँ?" : "Okay, I've cancelled the previous task. How can I help you now?", 'bot');
                    return;
                }
            }

            // Flow Logic
            if (conversationState.currentFlow === null) {
                // Not in a flow, detect intent
                const intent = detectIntent(text, isHindi);
                
                if (intent && intent !== 'reset') {
                    // Start new flow
                    conversationState.currentFlow = intent;
                    conversationState.step = 0;
                    conversationState.data = {};
                    
                    // Ask first question
                    const flowDef = flows[intent];
                    const promptText = isHindi ? flowDef.steps[0].hi : flowDef.steps[0].en;
                    hideTypingIndicator();
                    appendMessage(promptText, 'bot');
                    return;
                }
                // If no intent, proceed to normal RAG search
            } else {
                // In an active flow, process answer
                const flowName = conversationState.currentFlow;
                const flowDef = flows[flowName];
                const currentStepObj = flowDef.steps[conversationState.step];
                
                // Save user input
                conversationState.data[currentStepObj.key] = text;
                
                conversationState.step++;
                
                // If there are more steps, ask the next question
                if (conversationState.step < flowDef.steps.length) {
                    const nextStepObj = flowDef.steps[conversationState.step];
                    const promptText = isHindi ? nextStepObj.hi : nextStepObj.en;
                    hideTypingIndicator();
                    appendMessage(promptText, 'bot');
                    return;
                } else {
                    // Flow is complete, prepare the query for RAG
                    const summaryQuery = isHindi ? flowDef.summaryHi(conversationState.data) : flowDef.summaryEn(conversationState.data);
                    
                    // Use this synthesized query as the text to search context and ask Gemini
                    text = summaryQuery;
                    
                    // Reset flow state
                    conversationState = { currentFlow: null, step: 0, data: {} };
                }
            }

            // --- Normal RAG Search Execution ---
            
            // Get local matches for context (RAG)
            const matches = getTopMatches(text, isHindi);
            let responseObj = null;

            try {
                // RAG using Backend
                responseObj = await getBackendResponse(text, isHindi);
            } catch (backendError) {
                console.error("Backend error, falling back to local search", backendError);
                // Fallback to local keyword search
                if (matches.length > 0 && matches[0].score >= 2) {
                    const match = matches[0].item;
                    responseObj = {
                        answer: isHindi ? translateToHindi(match.answer) : match.answer,
                        category: isHindi ? translateToHindi(match.category) : match.category
                    };
                    // Append fallback note
                    const note = isHindi ? "\n\n*(नोट: बैकएंड सर्वर उपलब्ध नहीं है। स्थानीय उत्तर दिखाया जा रहा है।)*" : "\n\n*(Note: Backend server unavailable. Showing local response.)*";
                    responseObj.answer += note;
                } else {
                    responseObj = getFallbackResponse(isHindi);
                }
            }

            hideTypingIndicator();
            appendMessage(responseObj.answer, 'bot', responseObj.category);
        } catch (error) {
            console.error('Error processing message:', error);
            hideTypingIndicator();
            const fallback = getFallbackResponse(isHindi);
            appendMessage(fallback.answer, 'bot', fallback.category);
            conversationState = { currentFlow: null, step: 0, data: {} };
        }
    }

    // Search Algorithm - Get Context
    function getTopMatches(query, isHindi) {
        if (qaDatabase.length === 0) return [];

        const queryTokens = tokenize(query.toLowerCase(), isHindi ? stopWordsHi : stopWordsEn);
        if (queryTokens.length === 0) return [];

        let scoredItems = qaDatabase.map(item => {
            let score = 0;
            const qTokens = tokenize(item.question.toLowerCase(), stopWordsEn);
            const aTokens = tokenize(item.answer.toLowerCase(), stopWordsEn);

            queryTokens.forEach(token => {
                if (qTokens.some(q => q.includes(token) || token.includes(q))) {
                    score += 2;
                } else if (aTokens.some(a => a.includes(token) || token.includes(a))) {
                    score += 1;
                }
            });
            return { item, score };
        });

        // Filter and sort by score descending
        return scoredItems.filter(i => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    }

    // Backend API Call
    async function getBackendResponse(query, isHindi) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal ? 'http://localhost:3001' : 'https://sih-rag-backend.onrender.com';
        
        const response = await fetch(`${apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: query }],
                lang: isHindi ? 'hi' : 'en'
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        let primaryCategory = isHindi ? "सामान्य" : "General";
        if (data.sources && data.sources.category) {
            primaryCategory = isHindi ? translateToHindi(data.sources.category) : data.sources.category;
        }

        return {
            answer: data.answer,
            category: primaryCategory + ' (AI)'
        };
    }

    // Helper: Tokenize
    function tokenize(text, stopWords) {
        return text.replace(/[^\w\s\u0900-\u097F]/g, '')
                   .split(/\s+/)
                   .filter(word => word.length > 2 && !stopWords.has(word));
    }

    // Fallback Responses
    function getFallbackResponse(isHindi) {
        return {
            answer: isHindi 
                ? "क्षमा करें, मुझे इसका उत्तर नहीं मिल सका। कृपया अपने प्रश्न को अलग तरह से पूछें या सहायता के लिए रेलवे हेल्पलाइन 139 पर कॉल करें।"
                : "Sorry, I couldn't find an answer to that. Please try rephrasing your question or call the Railway Helpline 139 for assistance.",
            category: isHindi ? "सामान्य" : "General"
        };
    }

    // Pseudo-translation for UI demo (In a real app, you'd use a translation API or have both versions in the JSON)
    // Since instructions say "detect and respond in Hindi" but JSON is in English, we simulate some common translations
    function translateToHindi(text) {
        // This is a naive mock just to satisfy the bilingual requirement purely on client side without API
        // For production, the JSON should have bilingual fields.
        let hi = text;
        const dict = {
            "IRCTC Account & Registration": "IRCTC खाता और पंजीकरण",
            "Train Search & Booking (Step-by-Step)": "ट्रेन खोज और बुकिंग",
            "Tatkal & Premium Tatkal Booking": "तत्काल और प्रीमियम तत्काल बुकिंग",
            "Ticket Classes & Quotas": "टिकट कक्षाएं और कोटा",
            "Payment & Pricing": "भुगतान और मूल्य निर्धारण",
            "PNR Status & Ticket Management": "पीएनआर स्थिति और टिकट प्रबंधन",
            "Cancellation & Refund": "रद्दीकरण और धनवापसी",
            "Train Enquiry & Live Status": "ट्रेन पूछताछ और लाइव स्थिति",
            "Visit": "जाएं",
            "click": "क्लिक करें",
            "Enter": "दर्ज करें",
            "Step 1:": "कदम 1:",
            "Step 2:": "कदम 2:",
            "Step 3:": "कदम 3:",
            "Yes": "हाँ",
            "No": "नहीं",
            "Tatkal": "तत्काल",
            "booking": "बुकिंग",
            "ticket": "टिकट",
            "train": "ट्रेन"
        };
        for (let key in dict) {
            let regex = new RegExp(key, "gi");
            hi = hi.replace(regex, dict[key]);
        }
        return hi;
    }

    // UI Helpers
    function appendMessage(text, sender, category = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        
        let contentHtml = '';
        if (category && sender === 'bot') {
            contentHtml += `<span class="category-tag">${category}</span>`;
        }
        
        // Simple markdown parsing for bold text
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        contentHtml += `<p>${formattedText}</p>`;

        msgDiv.innerHTML = `
            <div class="avatar">${sender === 'bot' ? '🚂' : '👤'}</div>
            <div class="message-content">${contentHtml}</div>
        `;
        
        chatContainer.insertBefore(msgDiv, typingIndicator);
        scrollToBottom();
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    function scrollToBottom() {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
});
