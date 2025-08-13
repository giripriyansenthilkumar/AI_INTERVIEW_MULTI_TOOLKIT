// Constants and Configuration
const API_ENDPOINTS = {
    interview: {
        start: '/api/interview/start_interview',
        submit: '/api/interview/submit_answer',
        end: '/api/interview/end_interview'
    },
    resume: {
        upload: '/api/resume/upload_resume',
        optimize: '/api/resume/optimize'
    },
    research: '/api/research/company_role'
};

// Application State
const appState = {
    currentTab: 'mock-interview',
    interview: {
        sessionId: null,
        isRecording: false,
        mediaRecorder: null,
        audioBlob: null,
        conversationLog: [],
        hasMicrophoneAccess: false,
        questionCount: 0,
        questionParts: [], // array of sub-questions
        currentPartIndex: 0 // which part is being displayed/answered
    },
    resume: {
        uploadedFile: null,
        optimizedContent: null
    },
    research: {
        lastResults: null
    }
};

// DOM Element Selectors
const elements = {
    // Tab Navigation
    tabButtons: document.querySelectorAll('.tab-button'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    
    // Mock Interview Elements
    interviewSetupForm: document.getElementById('interview-setup-form'),
    interviewPanel: document.getElementById('interview-panel'),
    interviewForm: document.getElementById('interview-setup'),
    startInterviewBtn: document.getElementById('start-interview-btn'),
    startInterviewSpinner: document.getElementById('start-interview-spinner'),
    currentQuestion: document.getElementById('current-question'),
    ttsAudio: document.getElementById('tts-audio'),
    recordBtn: document.getElementById('record-btn'),
    recordText: document.getElementById('record-text'),
    recordingStatus: document.getElementById('recording-status'),
    textInputSection: document.getElementById('text-input-section'),
    textAnswer: document.getElementById('text-answer'),
    submitAnswerBtn: document.getElementById('submit-answer-btn'),
    submitAnswerSpinner: document.getElementById('submit-answer-spinner'),
    feedbackList: document.getElementById('feedback-list'),
    endInterviewBtn: document.getElementById('end-interview-btn'),
    interviewSummaryModal: document.getElementById('interview-summary-modal'),
    interviewSummaryContent: document.getElementById('interview-summary-content'),
    closeInterviewSummaryBtn: document.getElementById('close-interview-summary-btn'),
    
    // Resume Optimizer Elements
    resumeOptimizerForm: document.getElementById('resume-optimizer-form'),
    resumeDropZone: document.getElementById('resume-drop-zone'),
    resumeUpload: document.getElementById('resume-upload'),
    jobDescription: document.getElementById('job-description'),
    optimizeResumeBtn: document.getElementById('optimize-resume-btn'),
    optimizeResumeSpinner: document.getElementById('optimize-resume-spinner'),
    resumeResults: document.getElementById('resume-results'),
    optimizedResumePreview: document.getElementById('optimized-resume-preview'),
    resumeChanges: document.getElementById('resume-changes'),
    downloadResumeBtn: document.getElementById('download-resume-btn'),
    
    // Research Agent Elements
    researchForm: document.getElementById('research-form'),
    companyName: document.getElementById('company-name'),
    jobRole: document.getElementById('job-role'),
    researchBtn: document.getElementById('research-btn'),
    researchSpinner: document.getElementById('research-spinner'),
    researchResults: document.getElementById('research-results'),
    companySize: document.getElementById('company-size'),
    companyDomain: document.getElementById('company-domain'),
    companyNews: document.getElementById('company-news'),
    roleSkills: document.getElementById('role-skills'),
    roleExperience: document.getElementById('role-experience'),
    roleSalary: document.getElementById('role-salary'),
    
    // Shared Elements
    loadingOverlay: document.getElementById('loading-overlay')
};

// Utility Functions
function showElement(element) {
    if (element) element.classList.remove('hidden');
}

function hideElement(element) {
    if (element) element.classList.add('hidden');
}

function setButtonLoading(button, spinner, isLoading) {
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    button.disabled = isLoading;
    
    if (spinner) {
        isLoading ? showElement(spinner) : hideElement(spinner);
    }
    if (btnText) {
        isLoading ? hideElement(btnText) : showElement(btnText);
    }
}

function sanitizeText(text) {
    return text ? String(text).trim() : '';
}

function showError(message) {
    alert(`Error: ${message}`);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Tab Management Functions
function switchTab(tabId) {
    // Update tab buttons
    elements.tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        }
    });

    // Update tab panels
    elements.tabPanels.forEach(panel => {
        hideElement(panel); // hide all panels
        if (panel.id === tabId) {
            showElement(panel); // show the selected panel
        }
    });

    // Hide interview panel and setup form when switching tabs
    hideElement(elements.interviewPanel);
    hideElement(elements.interviewSetupForm);

    // Show only the selected tab panel
    elements.tabPanels.forEach(panel => {
        if (panel.id === tabId) {
            showElement(panel);
            // If switching to mock-interview, show setup form
            if (tabId === 'mock-interview') {
                showElement(elements.interviewSetupForm);
            }
        } else {
            hideElement(panel);
        }
    });

    appState.currentTab = tabId;
}

// Mock Data Generation Functions

function generateMockResumeOptimization() {
    return {
        optimized_resume: `JOHN SMITH
Software Engineer

SUMMARY
Results-driven Software Engineer with 3+ years of experience in full-stack development, specializing in React, Node.js, and Python. Proven track record of delivering scalable web applications and improving system performance by 40%.

TECHNICAL SKILLS
• Programming Languages: JavaScript, Python, Java, TypeScript
• Frontend: React, Vue.js, HTML5, CSS3, Responsive Design
• Backend: Node.js, Express, Django, REST APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud & DevOps: AWS, Docker, CI/CD, Git
• Testing: Jest, Pytest, Test-Driven Development

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2022 - Present
• Led development of customer-facing web application serving 50,000+ daily users
• Optimized database queries resulting in 40% improvement in page load times
• Implemented automated testing pipeline, reducing production bugs by 60%
• Mentored 2 junior developers and conducted code reviews

Software Developer | StartupXYZ | 2021 - 2022
• Built responsive e-commerce platform using React and Node.js
• Integrated payment systems and third-party APIs
• Collaborated with cross-functional teams in Agile environment

EDUCATION
Bachelor of Science in Computer Science | State University | 2021

PROJECTS
• Personal Finance Tracker: Full-stack application with React frontend and Express backend
• Machine Learning Price Predictor: Python-based ML model with 85% accuracy`,
        
        changes_explanation: [
            {
                type: 'added',
                description: 'Added quantifiable achievements (50,000+ users, 40% performance improvement)'
            },
            {
                type: 'modified',
                description: 'Enhanced technical skills section with more relevant technologies'
            },
            {
                type: 'added',
                description: 'Included specific project outcomes and impact metrics'
            },
            {
                type: 'modified',
                description: 'Restructured experience section to highlight leadership and mentoring'
            },
            {
                type: 'added',
                description: 'Added ATS-friendly keywords for better applicant tracking system compatibility'
            }
        ]
    };
}

function generateMockResearchData(company, role) {
    const mockData = {
        company_overview: {
            size: "Large Enterprise (50,000+ employees)",
            domain: "Technology, Cloud Computing, Software Development",
            latest_news: [
                {
                    title: company + " announces new AI initiative",
                    summary: "The company is investing $2B in artificial intelligence research and development to enhance their product offerings."
                },
                {
                    title: "Record quarterly earnings reported",
                    summary: "Strong performance across all business segments with 15% year-over-year growth in revenue."
                },
                {
                    title: "Expansion into emerging markets",
                    summary: "New offices opening in Southeast Asia as part of global expansion strategy."
                }
            ]
        },
        role_requirements: {
            skills: [
                "JavaScript", "React", "Node.js", "Python", "AWS", 
                "Docker", "Kubernetes", "Git", "Agile", "Problem Solving"
            ],
            experience: "3-5 years of professional software development experience",
            salary_range: "$95,000 - $140,000 annually (plus equity and benefits)"
        }
    };
    
    return mockData;
}

// Audio Recording Functions (Interview)
async function requestMicrophoneAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        appState.interview.hasMicrophoneAccess = true;
        
        appState.interview.mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        appState.interview.mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });

        appState.interview.mediaRecorder.addEventListener('stop', () => {
            appState.interview.audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks.length = 0;
            if (elements.submitAnswerBtn) {
                elements.submitAnswerBtn.disabled = false;
            }
        });

        return true;
    } catch (error) {
        console.warn('Microphone access denied:', error);
        appState.interview.hasMicrophoneAccess = false;
        showTextInput();
        return false;
    }
}

function startRecording() {
    if (!appState.interview.mediaRecorder || appState.interview.mediaRecorder.state !== 'inactive') {
        return;
    }

    appState.interview.isRecording = true;
    appState.interview.audioBlob = null;
    
    if (elements.recordText) {
        elements.recordText.textContent = '⏹️ Stop Recording';
    }
    if (elements.recordBtn) {
        elements.recordBtn.classList.add('btn--recording');
    }
    showElement(elements.recordingStatus);
    if (elements.submitAnswerBtn) {
        elements.submitAnswerBtn.disabled = true;
    }

    appState.interview.mediaRecorder.start();
}

function stopRecording() {
    if (!appState.interview.mediaRecorder || appState.interview.mediaRecorder.state !== 'recording') {
        return;
    }

    appState.interview.isRecording = false;
    
    if (elements.recordText) {
        elements.recordText.textContent = '🎤 Start Recording';
    }
    if (elements.recordBtn) {
        elements.recordBtn.classList.remove('btn--recording');
    }
    hideElement(elements.recordingStatus);

    appState.interview.mediaRecorder.stop();
}

function showTextInput() {
    showElement(elements.textInputSection);
    if (elements.submitAnswerBtn) {
        elements.submitAnswerBtn.disabled = false;
    }
    if (elements.textAnswer) {
        elements.textAnswer.focus();
    }
}

// API Communication Functions
async function makeApiCall(url, options) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log('API call failed, using mock data:', error.message);
        throw error;
    }
}

// Interview API Functions
async function startInterview(role, industry, difficulty) {
    // Call Gemini backend to get the first question
    try {
        const prompt = `You are an expert interviewer. Generate a technical interview question for a candidate applying for the role of ${role} in the ${industry} industry at ${difficulty} level.`;
        const response = await makeApiCall('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        return {
            session_id: 'session_' + Date.now(), // You may want to generate/track session on backend
            question: response.response
        };
    } catch (error) {
        showError('Failed to get interview question from Gemini.');
        throw error;
    }
}

async function submitAnswer(sessionId, audioBlob = null, textAnswer = null) {
    // Send answer to Gemini backend for evaluation and next question
    try {
        let answerText = textAnswer;
        if (audioBlob) {
            // Send audio to backend for transcription
            const formData = new FormData();
            formData.append('audio', audioBlob, 'answer.wav');
            const transcriptResponse = await makeApiCall('/api/interview/upload_audio', {
                method: 'POST',
                body: formData
            });
            if (transcriptResponse.error) {
                showError('Audio transcription failed: ' + transcriptResponse.error);
                throw new Error('Audio transcription failed');
            }
            answerText = transcriptResponse.transcript;
        }
        // Build prompt for Gemini evaluation
        const prompt = `Evaluate the following interview answer for a ${appState.interview.role} (${appState.interview.difficulty}):\n${answerText}\nProvide feedback and a follow-up technical question.`;
        const response = await makeApiCall('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        // Parse Gemini response: assume feedback + question separated by a delimiter
        let feedback = response.response;
        let nextQuestion = null;
        // If Gemini returns feedback + question, split by delimiter (customize as needed)
        if (feedback.includes('Next Question:')) {
            const parts = feedback.split('Next Question:');
            feedback = parts[0].trim();
            nextQuestion = parts[1].trim();
        }
        // Log question, answer, and feedback for summary
        appState.interview.conversationLog.push({
            question: appState.interview.questionParts[appState.interview.currentPartIndex] || '',
            answer: answerText,
            feedback: feedback
        });
        return {
            feedback,
            question: nextQuestion
        };
    } catch (error) {
        showError('Failed to get feedback from Gemini.');
        throw error;
    }
}

async function endInterview(sessionId) {
    try {
        // Send conversation log to backend for summary
        const payload = {
            session_id: sessionId,
            conversation_log: appState.interview.conversationLog
        };
        console.log('Sending endInterview payload:', payload);
        const data = await makeApiCall(API_ENDPOINTS.interview.end, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log('Received endInterview response:', data);
        // If backend returns fallback summary, show error
        if (data.summary && data.summary.includes('Great job on completing the mock interview!')) {
            showError('Backend returned fallback summary. Please check backend logs for errors.');
        }
        return data;
    } catch (error) {
        showError('Error ending interview: ' + error.message);
        throw error;
    }
}

// Resume API Functions
async function optimizeResume(file, jobDescription) {
    try {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('job_description', jobDescription);

        const data = await makeApiCall(API_ENDPOINTS.resume.optimize, {
            method: 'POST',
            body: formData
        });
        // Display optimized resume and change summary
        displayResumeResults(data.optimized_resume, data.changes_explanation);
        return data;
    } catch (error) {
        showError('Failed to optimize resume: ' + error.message);
        return null;
    }
}

// Research API Functions
async function researchCompanyRole(companyName, jobRole) {
    try {
        const data = await makeApiCall(API_ENDPOINTS.research, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company: companyName, role: jobRole })
        });
        return data;
    } catch (error) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateMockResearchData(companyName, jobRole));
            }, 2500);
        });
    }
}

// UI Update Functions
function splitQuestionIntoParts(question) {
    // Split by numbered list or bolded numbers, fallback to sentences
    // Example: "1. ... 2. ... 3. ..."
    const regex = /\d+\.\s+|\*\*\d+\*\*/g;
    let parts = question.split(regex).map(p => p.trim()).filter(Boolean);
    // If only one part, fallback to splitting by newlines or sentences
    if (parts.length <= 1) {
        parts = question.split(/\n\n|\n|\./).map(p => p.trim()).filter(Boolean);
    }
    return parts;
}

function displayCurrentQuestionPart() {
    const { questionParts, currentPartIndex } = appState.interview;
    if (elements.currentQuestion) {
        if (questionParts.length > 0 && currentPartIndex < questionParts.length) {
            elements.currentQuestion.textContent = sanitizeText(questionParts[currentPartIndex]);
        } else {
            elements.currentQuestion.textContent = 'No more questions.';
        }
    }
}

function addFeedback(feedback) {
    if (!elements.feedbackList) return;
    
    if (elements.feedbackList.children.length === 1 && 
        elements.feedbackList.firstElementChild.classList.contains('text-secondary')) {
        elements.feedbackList.innerHTML = '';
    }
    
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.textContent = sanitizeText(feedback);
    
    elements.feedbackList.appendChild(feedbackItem);
    feedbackItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayInterviewSummary(summary) {
    if (elements.interviewSummaryContent) {
        elements.interviewSummaryContent.textContent = sanitizeText(summary);
    }
    showElement(elements.interviewSummaryModal);
}

function displayResumeResults(optimizedResume, changes) {
    if (elements.optimizedResumePreview) {
        elements.optimizedResumePreview.textContent = optimizedResume;
    }
    
    if (elements.resumeChanges && changes) {
        elements.resumeChanges.innerHTML = '';
        changes.forEach(change => {
            const changeItem = document.createElement('div');
            changeItem.className = `change-item ${change.type}`;
            changeItem.textContent = change.description;
            elements.resumeChanges.appendChild(changeItem);
        });
    }
    
    showElement(elements.resumeResults);
    elements.resumeResults.scrollIntoView({ behavior: 'smooth' });
}

function displayResearchResults(data) {
    // Use Gemini structured results if present
    const results = data.results || {};
    // If no results, show error message in all fields
    const isEmpty = !results || Object.keys(results).length === 0 || (
        !results.company_summary && !results.skills && !results.experience_years && !results.latest_news
    );
    if (isEmpty) {
        if (elements.companySize) elements.companySize.textContent = 'No data available.';
        if (elements.companyDomain) elements.companyDomain.textContent = 'No data available.';
        if (elements.companyNews) elements.companyNews.innerHTML = '<div class="news-item">No news available.</div>';
        if (elements.roleSkills) elements.roleSkills.innerHTML = '<div class="skills-list">No skills found.</div>';
        if (elements.roleExperience) elements.roleExperience.textContent = 'No data available.';
        if (elements.roleSalary) elements.roleSalary.textContent = 'No data available.';
        return;
    }
    // Company Overview
    if (elements.companySize && results.company_summary) {
        elements.companySize.textContent = Array.isArray(results.company_summary) ? results.company_summary.join(' ') : results.company_summary;
    }
    if (elements.companyDomain) {
        if (results.business_domain) {
            elements.companyDomain.textContent = results.business_domain;
        } else if (results.company_domain) {
            elements.companyDomain.textContent = results.company_domain;
        } else {
            elements.companyDomain.textContent = 'No data available.';
        }
    }
    // Company News (if present)
    if (elements.companyNews && results.latest_news) {
        elements.companyNews.innerHTML = '';
        results.latest_news.forEach(news => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <div class="news-title">${news.title || ''}</div>
                <p class="news-summary">${news.summary || news}</p>
            `;
            elements.companyNews.appendChild(newsItem);
        });
    }
    // Role Requirements
    if (elements.roleSkills && results.skills) {
        elements.roleSkills.innerHTML = '<div class="skills-list"></div>';
        const skillsList = elements.roleSkills.querySelector('.skills-list');
        results.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsList.appendChild(skillTag);
        });
    }
    if (elements.roleExperience && results.experience_years) {
        elements.roleExperience.textContent = results.experience_years;
    }
    if (elements.roleSalary && results.salary_range) {
        elements.roleSalary.textContent = results.salary_range;
    }
    
    showElement(elements.researchResults);
    elements.researchResults.scrollIntoView({ behavior: 'smooth' });
}

function displayQuestion(question) {
    if (elements.currentQuestion) {
        // Remove '**Question:**' and similar markers
        let clean = question;
        if (typeof clean === 'string') {
            clean = clean.replace(/\*\*Question:\*\*\s*/i, '').replace(/Question:\s*/i, '');
        }
        // Split main question and sub-parts
        let main = clean;
        let subs = [];
        // If question contains line breaks, split
        if (typeof clean === 'string' && clean.includes('\n')) {
            const lines = clean.split(/\n+/).map(l => l.trim()).filter(Boolean);
            if (lines.length > 1) {
                main = lines[0];
                subs = lines.slice(1);
            }
        }
        // If question contains numbered/bulleted sub-parts, split
        if (typeof clean === 'string' && (clean.match(/\d+\.\s+/g) || clean.match(/\*/g))) {
            const numbered = clean.split(/\d+\.\s+/).map(l => l.trim()).filter(Boolean);
            if (numbered.length > 1) {
                main = numbered[0];
                subs = numbered.slice(1);
            }
        }
        // Render main question in bold/heading
        let html = `<strong>${sanitizeText(main)}</strong>`;
        // Render sub-questions/instructions as a list
        if (subs.length > 0) {
            html += '<ul>' + subs.map(s => `<li>${sanitizeText(s)}</li>`).join('') + '</ul>';
        }
        elements.currentQuestion.innerHTML = html;
    }
}

// Event Handlers
async function handleStartInterview(event) {
    event.preventDefault();
    
    const role = sanitizeText(document.getElementById('interview-role').value);
    const industry = sanitizeText(document.getElementById('interview-industry').value);
    const difficulty = sanitizeText(document.getElementById('interview-difficulty').value);
    
    if (!role || !industry || !difficulty) {
        showError('Please fill in all fields');
        return;
    }
    
    setButtonLoading(elements.startInterviewBtn, elements.startInterviewSpinner, true);
    
    try {
        const data = await startInterview(role, industry, difficulty);

        appState.interview.sessionId = data.session_id;
        appState.interview.conversationLog = [];
        appState.interview.questionCount = 1;
        // Split compound question into parts
        appState.interview.questionParts = splitQuestionIntoParts(data.question);
        appState.interview.currentPartIndex = 0;

        // Request microphone access (optional)
        try {
            await requestMicrophoneAccess();
        } catch (error) {
            console.log('Microphone access not available, using text input fallback');
            showTextInput();
        }

        // Switch to interview panel
        hideElement(elements.interviewSetupForm);
        showElement(elements.interviewPanel);
        elements.interviewPanel.classList.add('fade-in');

        // Display first question part
        displayCurrentQuestionPart();

        console.log('Interview started successfully with session:', data.session_id);
        
    } catch (error) {
        console.error('Interview start error:', error);
        showError(`Failed to start interview: ${error.message}`);
    } finally {
        setButtonLoading(elements.startInterviewBtn, elements.startInterviewSpinner, false);
    }
}

function handleRecordToggle() {
    if (!appState.interview.hasMicrophoneAccess) return;
    
    if (appState.interview.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function handleSubmitAnswer() {
    if (!appState.interview.sessionId) {
        showError('No active session');
        return;
    }
    
    const hasAudio = appState.interview.audioBlob !== null;
    const hasText = elements.textAnswer && elements.textAnswer.value.trim() !== '';
    
    if (!hasAudio && !hasText) {
        showError('Please record an answer or type a response');
        return;
    }
    
    setButtonLoading(elements.submitAnswerBtn, elements.submitAnswerSpinner, true);
    
    try {
        // Get current question part
        const currentPart = appState.interview.questionParts[appState.interview.currentPartIndex];
        const answerText = hasText ? sanitizeText(elements.textAnswer.value) : null;
        // Send answer to Gemini for feedback (optionally include the question part)
        const data = await submitAnswer(
            appState.interview.sessionId,
            hasAudio ? appState.interview.audioBlob : null,
            answerText
        );

        addFeedback(data.feedback);

        // Move to next part if available
        appState.interview.currentPartIndex++;
        if (appState.interview.currentPartIndex < appState.interview.questionParts.length) {
            displayCurrentQuestionPart();
        } else {
            displayQuestion("Great job! You've completed all the questions. Click 'End Interview' to see your summary.");
        }

        // Reset inputs
        appState.interview.audioBlob = null;
        if (elements.textAnswer) elements.textAnswer.value = '';
        if (elements.submitAnswerBtn) elements.submitAnswerBtn.disabled = true;
        if (appState.interview.isRecording) stopRecording();

    } catch (error) {
        showError(`Failed to submit answer: ${error.message}`);
    } finally {
        setButtonLoading(elements.submitAnswerBtn, elements.submitAnswerSpinner, false);
    }
}

async function handleEndInterview() {
    if (!appState.interview.sessionId) {
        showError('No active session');
        return;
    }
    
    showElement(elements.loadingOverlay);
    
    try {
        const data = await endInterview(appState.interview.sessionId);
        displayInterviewSummary(data.summary);
    } catch (error) {
        showError(`Failed to end interview: ${error.message}`);
    } finally {
        hideElement(elements.loadingOverlay);
    }
}

function handleCloseInterviewSummary() {
    hideElement(elements.interviewSummaryModal);
    
    // Reset interview state
    appState.interview.sessionId = null;
    appState.interview.conversationLog = [];
    appState.interview.questionCount = 0;
    
    // Show setup form and hide interview panel
    showElement(elements.interviewSetupForm);
    hideElement(elements.interviewPanel);
    
    // Reset forms and content
    if (elements.interviewForm) elements.interviewForm.reset();
    if (elements.feedbackList) {
        elements.feedbackList.innerHTML = '<p class="text-secondary">Your feedback will appear here after submitting answers.</p>';
    }
    if (elements.currentQuestion) {
        elements.currentQuestion.textContent = 'Loading your first question...';
    }
    
    // Stop media recorder
    if (appState.interview.mediaRecorder && appState.interview.mediaRecorder.stream) {
        appState.interview.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    appState.interview.hasMicrophoneAccess = false;
    appState.interview.audioBlob = null;
    appState.interview.isRecording = false;
}

async function handleOptimizeResume(event) {
    event.preventDefault();
    
    const file = appState.resume.uploadedFile;
    const jobDesc = sanitizeText(elements.jobDescription.value);
    
    if (!file || !jobDesc) {
        showError('Please upload a resume and enter a job description');
        return;
    }
    
    setButtonLoading(elements.optimizeResumeBtn, elements.optimizeResumeSpinner, true);
    
    try {
        const data = await optimizeResume(file, jobDesc);
        if (!data || !data.optimized_resume) {
            const errMsg = data && data.error ? data.error : 'No optimized resume returned.';
            showError(`Failed to optimize resume: ${errMsg}`);
            return;
        }
    appState.resume.optimizedContent = data.optimized_resume;
    appState.resume.optimizedTxtPath = data.optimized_path || null;
    displayResumeResults(data.optimized_resume, data.changes_explanation);
    } catch (error) {
        showError(`Failed to optimize resume: ${error.message}`);
    } finally {
        setButtonLoading(elements.optimizeResumeBtn, elements.optimizeResumeSpinner, false);
    }
}

async function handleResearch(event) {
    event.preventDefault();
    
    const company = sanitizeText(elements.companyName.value);
    const role = sanitizeText(elements.jobRole.value);
    
    if (!company || !role) {
        showError('Please enter both company name and job role');
        return;
    }
    
    setButtonLoading(elements.researchBtn, elements.researchSpinner, true);
    
    try {
        const data = await researchCompanyRole(company, role);
        appState.research.lastResults = data;
        displayResearchResults(data);
    } catch (error) {
        showError(`Failed to research: ${error.message}`);
    } finally {
        setButtonLoading(elements.researchBtn, elements.researchSpinner, false);
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        appState.resume.uploadedFile = file;
        updateDropZone(file);
    }
}

function handleFileDrop(event) {
    event.preventDefault();
    elements.resumeDropZone.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        appState.resume.uploadedFile = file;
        updateDropZone(file);
        elements.resumeUpload.files = files;
    }
}

function updateDropZone(file) {
    if (!elements.resumeDropZone) return;
    
    elements.resumeDropZone.classList.add('has-file');
    const content = elements.resumeDropZone.querySelector('.drop-zone-content');
    if (content) {
        content.innerHTML = `
            <div class="drop-zone-icon">✓</div>
            <p class="drop-zone-text">${file.name}</p>
            <p class="drop-zone-subtext">${formatFileSize(file.size)}</p>
        `;
    }
}

function handleDownloadResume() {
    if (appState.resume.optimizedContent) {
        // Always download TXT from in-memory resume content
        const blob = new Blob([appState.resume.optimizedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized_resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        showError('No optimized resume to download');
    }
}

function handleTextInputChange() {
    if (!elements.textAnswer || !elements.submitAnswerBtn) return;
    
    const hasText = elements.textAnswer.value.trim() !== '';
    elements.submitAnswerBtn.disabled = !hasText && !appState.interview.audioBlob;
}

// Initialize Application
function initializeApp() {
    console.log('Initializing AI Career Preparation Toolkit...');
    
    // Tab Navigation
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
    
    // Interview Event Listeners
    if (elements.interviewForm) {
        elements.interviewForm.addEventListener('submit', handleStartInterview);
    }
    if (elements.recordBtn) {
        elements.recordBtn.addEventListener('click', handleRecordToggle);
    }
    if (elements.submitAnswerBtn) {
        elements.submitAnswerBtn.addEventListener('click', handleSubmitAnswer);
    }
    if (elements.endInterviewBtn) {
        elements.endInterviewBtn.addEventListener('click', handleEndInterview);
    }
    if (elements.closeInterviewSummaryBtn) {
        elements.closeInterviewSummaryBtn.addEventListener('click', handleCloseInterviewSummary);
    }
    if (elements.textAnswer) {
        elements.textAnswer.addEventListener('input', handleTextInputChange);
    }
    
    // Resume Optimizer Event Listeners
    if (elements.resumeOptimizerForm) {
        elements.resumeOptimizerForm.addEventListener('submit', handleOptimizeResume);
    }
    if (elements.resumeUpload) {
        elements.resumeUpload.addEventListener('change', handleFileUpload);
    }
    if (elements.downloadResumeBtn) {
        elements.downloadResumeBtn.addEventListener('click', handleDownloadResume);
    }
    
    // File Drop Zone Event Listeners
    if (elements.resumeDropZone) {
        elements.resumeDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.resumeDropZone.classList.add('drag-over');
        });
        elements.resumeDropZone.addEventListener('dragleave', () => {
            elements.resumeDropZone.classList.remove('drag-over');
        });
        elements.resumeDropZone.addEventListener('drop', handleFileDrop);
    }
    
    // Research Event Listeners
    if (elements.researchForm) {
        elements.researchForm.addEventListener('submit', handleResearch);
    }
    
    // Modal Event Listeners
    if (elements.interviewSummaryModal) {
        elements.interviewSummaryModal.addEventListener('click', (event) => {
            if (event.target === elements.interviewSummaryModal) {
                handleCloseInterviewSummary();
            }
        });
    }
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.interviewSummaryModal && !elements.interviewSummaryModal.classList.contains('hidden')) {
            handleCloseInterviewSummary();
        }
        
        if (event.code === 'Space' && appState.currentTab === 'mock-interview' && 
            elements.interviewPanel && !elements.interviewPanel.classList.contains('hidden') && 
            event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            handleRecordToggle();
        }
    });
    
    console.log('AI Career Preparation Toolkit initialized successfully');
    console.log('Demo mode: Using mock data when backend is not available');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        // On initial load, show only mock-interview tab and setup form
        elements.tabPanels.forEach(panel => {
            if (panel.id === 'mock-interview') {
                showElement(panel);
            } else {
                hideElement(panel);
            }
        });
        showElement(elements.interviewSetupForm);
        hideElement(elements.interviewPanel);
    });
} else {
    initializeApp();
    elements.tabPanels.forEach(panel => {
        if (panel.id === 'mock-interview') {
            showElement(panel);
        } else {
            hideElement(panel);
        }
    });
    showElement(elements.interviewSetupForm);
    hideElement(elements.interviewPanel);
}