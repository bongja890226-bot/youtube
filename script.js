// ================== 전역 상태 관리 ==================
let currentState = {
    projectTitle: '',
    originalScript: '',
    suggestedTopics: [],
    selectedTopic: null,
    generatedScript: ''
};

// ================== DOM 요소 참조 ==================
const elements = {
    projectTitle: document.getElementById('projectTitle'),
    originalScript: document.getElementById('originalScript'),
    charCount: document.getElementById('charCount'),
    suggestTopicsBtn: document.getElementById('suggestTopicsBtn'),
    topicsSection: document.getElementById('topicsSection'),
    topicsList: document.getElementById('topicsList'),
    generateScriptBtn: document.getElementById('generateScriptBtn'),
    outputSection: document.getElementById('outputSection'),
    generatedScript: document.getElementById('generatedScript'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    saveBtn: document.getElementById('saveBtn'),
    projectsList: document.getElementById('projectsList')
};

// ================== 초기화 ==================
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
});

// ================== 이벤트 리스너 설정 ==================
function setupEventListeners() {
    // 글자 수 카운트
    elements.originalScript.addEventListener('input', updateCharCount);
    
    // 주제 추천 버튼
    elements.suggestTopicsBtn.addEventListener('click', suggestTopics);
    
    // 새 대본 작성 버튼
    elements.generateScriptBtn.addEventListener('click', generateScript);
    
    // 복사 버튼
    elements.copyBtn.addEventListener('click', copyToClipboard);
    
    // 다운로드 버튼
    elements.downloadBtn.addEventListener('click', downloadScript);
    
    // 저장 버튼
    elements.saveBtn.addEventListener('click', saveProject);
}

// ================== 글자 수 업데이트 ==================
function updateCharCount() {
    const count = elements.originalScript.value.length;
    elements.charCount.textContent = count;
    
    if (count > 20000) {
        elements.charCount.style.color = '#f44336';
    } else {
        elements.charCount.style.color = '#999';
    }
}

// ================== 주제 추천 기능 ==================
function suggestTopics() {
    const script = elements.originalScript.value.trim();
    
    // 유효성 검사
    if (!script) {
        showNotification('대본을 입력해 주세요', 'warning');
        return;
    }
    
    if (script.length > 20000) {
        showNotification('대본이 너무 깁니다 (20,000자 이하)', 'error');
        return;
    }
    
    // 주제 분석 및 추천 (규칙 기반)
    const topics = analyzeAndSuggestTopics(script);
    currentState.suggestedTopics = topics;
    
    // UI 업데이트
    displayTopics(topics);
    elements.topicsSection.style.display = 'block';
    
    // 섹션으로 스크롤
    elements.topicsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ================== 주제 분석 로직 (규칙 기반) ==================
function analyzeAndSuggestTopics(script) {
    // 키워드 추출
    const keywords = extractKeywords(script);
    
    // 주제 카테고리 분석
    const categories = analyzeCategories(script, keywords);
    
    // 3-5개의 다양한 주제 생성
    const topics = [];
    
    // 카테고리별로 주제 생성
    if (categories.howTo) {
        topics.push({
            id: 1,
            title: `${keywords[0] || '주제'}를 활용한 실전 가이드`,
            description: '초보자도 쉽게 따라할 수 있는 단계별 실행 방법을 중심으로 재구성'
        });
    }
    
    if (categories.problem) {
        topics.push({
            id: 2,
            title: `${keywords[0] || '이 문제'}를 해결하는 3가지 방법`,
            description: '문제 상황과 해결책에 초점을 맞춘 솔루션 중심 콘텐츠'
        });
    }
    
    if (categories.story) {
        topics.push({
            id: 3,
            title: `${keywords[0] || '이야기'}에서 배우는 핵심 교훈`,
            description: '스토리텔링을 활용해 교훈과 인사이트를 전달하는 내러티브 방식'
        });
    }
    
    topics.push({
        id: 4,
        title: `${keywords[0] || '주제'}의 숨겨진 진실`,
        description: '일반적으로 알려지지 않은 심층 정보와 새로운 관점 제시'
    });
    
    topics.push({
        id: 5,
        title: `${keywords[1] || '관련 주제'}로 시작하는 변화`,
        description: '실제 적용 가능한 액션 플랜과 구체적인 실행 전략 제공'
    });
    
    return topics.slice(0, Math.min(5, topics.length));
}

// ================== 키워드 추출 ==================
function extractKeywords(script) {
    // 간단한 키워드 추출 (단어 빈도 기반)
    const words = script
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // 빈도순 정렬
    const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    
    return sorted.length > 0 ? sorted : ['주제'];
}

// ================== 카테고리 분석 ==================
function analyzeCategories(script, keywords) {
    const lowerScript = script.toLowerCase();
    
    return {
        howTo: /어떻게|방법|how to|가이드|단계|절차/.test(lowerScript),
        problem: /문제|해결|challenge|issue|고민|어려움/.test(lowerScript),
        story: /이야기|스토리|경험|사례|story|케이스/.test(lowerScript),
        tips: /팁|tip|노하우|비법|꿀팁/.test(lowerScript),
        review: /리뷰|review|평가|분석|후기/.test(lowerScript)
    };
}

// ================== 주제 목록 표시 ==================
function displayTopics(topics) {
    elements.topicsList.innerHTML = topics.map(topic => `
        <div class="topic-item" onclick="selectTopic(${topic.id})">
            <input type="radio" name="topic" value="${topic.id}" id="topic-${topic.id}">
            <div class="topic-content">
                <div class="topic-title">${topic.title}</div>
                <div class="topic-description">${topic.description}</div>
            </div>
        </div>
    `).join('');
}

// ================== 주제 선택 ==================
function selectTopic(topicId) {
    // 라디오 버튼 체크
    document.getElementById(`topic-${topicId}`).checked = true;
    
    // 선택된 항목 스타일 업데이트
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // 상태 업데이트
    currentState.selectedTopic = currentState.suggestedTopics.find(t => t.id === topicId);
}

// ================== 새 대본 생성 ==================
function generateScript() {
    if (!currentState.selectedTopic) {
        showNotification('주제를 선택해 주세요', 'warning');
        return;
    }
    
    // 대본 생성 (템플릿 기반)
    const newScript = createScriptTemplate(
        currentState.selectedTopic,
        elements.originalScript.value
    );
    
    currentState.generatedScript = newScript;
    elements.generatedScript.value = newScript;
    
    // 출력 섹션 표시
    elements.outputSection.style.display = 'block';
    elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    showNotification('새 대본이 생성되었습니다', 'success');
}

// ================== 대본 템플릿 생성 ==================
function createScriptTemplate(topic, originalScript) {
    const keywords = extractKeywords(originalScript);
    const mainKeyword = keywords[0] || '주제';
    
    return `# ${topic.title}

## 🎯 후킹 (Hook)
안녕하세요! 오늘은 ${mainKeyword}에 대해 이야기해보려고 합니다.
이 영상을 끝까지 보시면, ${topic.description}

여러분도 이런 고민 해보신 적 있으신가요?
지금부터 그 해답을 함께 찾아보겠습니다.

## 📌 문제 정의 (Problem)
많은 분들이 ${mainKeyword}에 대해 이런 어려움을 겪고 계십니다:
• 어디서부터 시작해야 할지 모르겠다
• 정보는 많은데 실제로 적용하기 어렵다
• 시행착오를 겪으며 시간을 낭비하고 있다

이런 문제들은 사실 근본적인 이해 부족에서 비롯됩니다.

## 💡 해결책 & 핵심 포인트 (Solution)
그래서 저는 다음 3가지 핵심 원칙을 제안합니다:

**1. 첫 번째 핵심 원칙**
${mainKeyword}의 기본 원리를 이해하는 것이 가장 중요합니다.
복잡해 보이지만, 핵심은 생각보다 단순합니다.

**2. 두 번째 핵심 원칙**
이론보다 실천이 중요합니다.
작은 것부터 시작해서 점진적으로 확장해 나가세요.

**3. 세 번째 핵심 원칙**
지속적인 개선과 피드백 루프를 만드세요.
한 번에 완벽할 필요는 없습니다.

## 🔍 사례 & 실전 적용 (Case Study)
실제 사례를 통해 살펴보겠습니다.

한 사용자는 이 방법을 적용한 후 다음과 같은 결과를 얻었습니다:
• 효율성 2배 증가
• 시간 절약 50%
• 만족도 크게 향상

여러분도 충분히 할 수 있습니다.
핵심은 꾸준함과 올바른 방향성입니다.

## 🚀 행동 촉구 (Call-to-Action)
오늘 배운 내용을 정리하면:
1. ${mainKeyword}의 핵심 원리 이해하기
2. 작은 것부터 실천하기
3. 지속적으로 개선하기

지금 바로 시작해보세요!
오늘부터 하루에 10분만 투자해도 큰 변화를 만들 수 있습니다.

이 영상이 도움이 되셨다면 좋아요와 구독 부탁드립니다.
댓글로 여러분의 경험도 공유해주세요!

다음 영상에서 더 깊이 있는 내용으로 찾아뵙겠습니다.
감사합니다! 🙏
`;
}

// ================== 클립보드 복사 ==================
function copyToClipboard() {
    const text = elements.generatedScript.value;
    
    if (!text) {
        showNotification('복사할 내용이 없습니다', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('클립보드에 복사되었습니다', 'success');
    }).catch(() => {
        showNotification('복사에 실패했습니다', 'error');
    });
}

// ================== 다운로드 ==================
function downloadScript() {
    const text = elements.generatedScript.value;
    
    if (!text) {
        showNotification('다운로드할 내용이 없습니다', 'warning');
        return;
    }
    
    const projectName = elements.projectTitle.value || '새_대본';
    const filename = `${projectName}_${new Date().getTime()}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('다운로드가 시작되었습니다', 'success');
}

// ================== LocalStorage 관리 ==================
function saveProject() {
    const project = {
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: elements.projectTitle.value || '제목 없음',
        original: elements.originalScript.value,
        chosenTopic: currentState.selectedTopic ? currentState.selectedTopic.title : null,
        generated: elements.generatedScript.value,
        updatedAt: Date.now()
    };
    
    // 유효성 검사
    if (!project.original && !project.generated) {
        showNotification('저장할 내용이 없습니다', 'warning');
        return;
    }
    
    try {
        // 기존 프로젝트 목록 가져오기
        const projects = getProjects();
        projects.unshift(project);
        
        // LocalStorage에 저장
        localStorage.setItem('youtube-script-projects', JSON.stringify(projects));
        
        showNotification('프로젝트가 저장되었습니다', 'success');
        loadProjects();
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showNotification('저장 공간이 부족합니다', 'error');
        } else {
            showNotification('저장에 실패했습니다', 'error');
        }
    }
}

// ================== 프로젝트 목록 가져오기 ==================
function getProjects() {
    try {
        const data = localStorage.getItem('youtube-script-projects');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('프로젝트 로드 실패:', e);
        return [];
    }
}

// ================== 프로젝트 목록 표시 ==================
function loadProjects() {
    const projects = getProjects();
    
    if (projects.length === 0) {
        elements.projectsList.innerHTML = '<p class="empty-message">저장된 프로젝트가 없습니다</p>';
        return;
    }
    
    elements.projectsList.innerHTML = projects.map(project => `
        <div class="project-item" onclick="loadProject('${project.id}')">
            <div class="project-header">
                <div class="project-name">${project.name}</div>
                <div class="project-actions">
                    <button class="project-action-btn" onclick="event.stopPropagation(); renameProject('${project.id}')">이름 변경</button>
                    <button class="project-action-btn" onclick="event.stopPropagation(); deleteProject('${project.id}')">삭제</button>
                </div>
            </div>
            <div class="project-date">${formatDate(project.updatedAt)}</div>
        </div>
    `).join('');
}

// ================== 프로젝트 불러오기 ==================
function loadProject(projectId) {
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        showNotification('프로젝트를 찾을 수 없습니다', 'error');
        return;
    }
    
    // UI에 데이터 로드
    elements.projectTitle.value = project.name;
    elements.originalScript.value = project.original;
    updateCharCount();
    
    if (project.chosenTopic) {
        const topic = { id: 1, title: project.chosenTopic, description: '저장된 주제' };
        currentState.suggestedTopics = [topic];
        currentState.selectedTopic = topic;
        displayTopics([topic]);
        elements.topicsSection.style.display = 'block';
    }
    
    if (project.generated) {
        elements.generatedScript.value = project.generated;
        currentState.generatedScript = project.generated;
        elements.outputSection.style.display = 'block';
    }
    
    showNotification('프로젝트를 불러왔습니다', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================== 프로젝트 이름 변경 ==================
function renameProject(projectId) {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        showNotification('프로젝트를 찾을 수 없습니다', 'error');
        return;
    }
    
    const newName = prompt('새 프로젝트 이름을 입력하세요:', projects[projectIndex].name);
    
    if (newName !== null && newName.trim()) {
        projects[projectIndex].name = newName.trim();
        projects[projectIndex].updatedAt = Date.now();
        localStorage.setItem('youtube-script-projects', JSON.stringify(projects));
        loadProjects();
        showNotification('프로젝트 이름이 변경되었습니다', 'success');
    }
}

// ================== 프로젝트 삭제 ==================
function deleteProject(projectId) {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
        return;
    }
    
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    
    localStorage.setItem('youtube-script-projects', JSON.stringify(filtered));
    loadProjects();
    showNotification('프로젝트가 삭제되었습니다', 'success');
}

// ================== 날짜 포맷팅 ==================
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ================== 알림 표시 ==================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
