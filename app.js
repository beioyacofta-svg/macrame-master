const templates = [
  { id: 'keychain', title: 'Брелок', description: 'Быстрый проект для знакомства с узлами.', width: 3, height: 12, cord: 3, total: 4.8, time: 35, steps: 8, knots: 3, groups: [{ name: 'Рабочие нити', count: 4, length: 1.2 }] },
  { id: 'feather', title: 'Перо', description: 'Лёгкая форма с мягкой хлопковой бахромой.', width: 10, height: 17, cord: 3, total: 7.01, time: 75, steps: 10, knots: 2, groups: [{ name: 'Центральная нить', count: 1, length: .55 }, { name: 'Нити бахромы', count: 24, length: .24 }, { name: 'Подвес', count: 1, length: .7 }] },
  { id: 'planter', title: 'Кашпо', description: 'Подвес для небольшого комнатного растения.', width: 14, height: 75, cord: 4, total: 25.2, time: 120, steps: 13, knots: 4, groups: [{ name: 'Основные нити', count: 8, length: 3 }, { name: 'Обмоточные нити', count: 2, length: .6 }] },
  { id: 'panel', title: 'Мини-панно', description: 'Небольшой интерьерный акцент на деревянной основе.', width: 12, height: 25, cord: 5, total: 9.5, time: 110, steps: 14, knots: 3, groups: [{ name: 'Основные нити', count: 10, length: .9 }, { name: 'Подвес', count: 1, length: .5 }] },
  { id: 'bag', title: 'Сумка-сетка', description: 'Практичная сумка с ручками и воздушным узором.', width: 22, height: 25, cord: 3, total: 49.6, time: 270, steps: 17, knots: 5, groups: [{ name: 'Полотно сумки', count: 16, length: 2.5 }, { name: 'Ручки', count: 2, length: 4 }, { name: 'Сборка и обмотка', count: 2, length: .8 }] }
];

const grid = document.querySelector('#projectGrid');
const dialog = document.querySelector('#projectDialog');
const setupStep = dialog.querySelector('[data-step="setup"]');
const resultStep = dialog.querySelector('[data-step="result"]');
const ideaInput = document.querySelector('#ideaInput');
const savedButton = document.querySelector('#savedButton span');
const toast = document.querySelector('#toast');
const homeMain = document.querySelector('body > main');
const topbar = document.querySelector('.topbar');
const weavingScreen = document.querySelector('#weavingScreen');
const finishDialog = document.querySelector('#finishDialog');
const lessonVideo = document.querySelector('#lessonVideo');
const videoPlaceholder = document.querySelector('#videoPlaceholder');
let selected = templates[0];
let currentResult = null;
let currentStep = 0;

function storageGet(key, fallback = null) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

let savedCount = Number(storageGet('macrameSavedCount', '0'));
savedButton.textContent = savedCount;

const timeLabel = minutes => minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч ${minutes % 60 ? `${minutes % 60} мин` : ''}`.trim();
const roundUp = (number, step = .1) => Math.ceil(number / step) * step;

grid.innerHTML = templates.map((item, index) => `
  <article class="project-card">
    <span class="card-number">0${index + 1}</span>
    <span class="card-shape" aria-hidden="true"></span>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="card-meta"><span>${item.total.toLocaleString('ru-RU')} м</span><span>${timeLabel(item.time)}</span></div>
    <button class="card-button" type="button" data-project="${item.id}" aria-label="Создать проект: ${item.title}">↗</button>
  </article>
`).join('');

function findByIdea(text) {
  const value = text.toLowerCase();
  if (/сум|шоп/.test(value)) return templates.find(t => t.id === 'bag');
  if (/каш|цвет|горш/.test(value)) return templates.find(t => t.id === 'planter');
  if (/панн|стен/.test(value)) return templates.find(t => t.id === 'panel');
  if (/пер|лист/.test(value)) return templates.find(t => t.id === 'feather');
  return templates.find(t => t.id === 'keychain');
}

function openProject(template) {
  selected = template;
  setupStep.hidden = false;
  resultStep.hidden = true;
  document.querySelector('#dialogTitle').textContent = template.title;
  document.querySelector('#dialogDescription').textContent = `${template.description} Уточни параметры — и получишь схему нарезки.`;
  document.querySelector('#widthInput').value = template.width;
  document.querySelector('#heightInput').value = template.height;
  document.querySelector('#cordInput').value = template.cord;
  dialog.showModal();
}

document.querySelector('#ideaForm').addEventListener('submit', event => {
  event.preventDefault();
  openProject(findByIdea(ideaInput.value || 'брелок'));
});

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  openProject(templates.find(item => item.id === button.dataset.project));
});

document.querySelector('#calculateButton').addEventListener('click', () => {
  const width = Number(document.querySelector('#widthInput').value);
  const height = Number(document.querySelector('#heightInput').value);
  const cord = Number(document.querySelector('#cordInput').value);
  const density = Number(document.querySelector('#densityInput').value);
  if (!width || !height) return;

  const areaScale = Math.sqrt((width * height) / (selected.width * selected.height));
  const diameterScale = selected.cord / cord;
  const pieceScale = areaScale * diameterScale * density;
  const groups = selected.groups.map(group => ({ ...group, scaledLength: roundUp(group.length * pieceScale) }));
  const total = groups.reduce((sum, group) => sum + group.count * group.scaledLength, 0);
  const time = Math.max(20, Math.round(selected.time * areaScale * density / 5) * 5);
  currentResult = { width, height, cord, groups, total, time };

  document.querySelector('#resultTitle').textContent = `${selected.title} ${width} × ${height} см`;
  document.querySelector('#resultMetrics').innerHTML = `
    <div class="metric"><b>${total.toFixed(1).replace('.', ',')} м</b><span>шнура</span></div>
    <div class="metric"><b>${selected.knots}</b><span>типа узлов</span></div>
    <div class="metric"><b>${timeLabel(time)}</b><span>примерно</span></div>
  `;
  document.querySelector('#cutList').innerHTML = groups.map(group => `
    <div class="cut-row"><span>${group.name}</span><strong>${group.count} × ${group.scaledLength.toFixed(2).replace('.', ',')} м</strong></div>
  `).join('');
  setupStep.hidden = true;
  resultStep.hidden = false;
});

document.querySelector('#backButton').addEventListener('click', () => {
  resultStep.hidden = true;
  setupStep.hidden = false;
});

document.querySelector('#saveButton').addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  if (!currentResult) return;

  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Открываю проект…';
  savedCount += 1;
  storageSet('macrameSavedCount', String(savedCount));
  storageSet('macrameLastProject', JSON.stringify({ template: selected.id, ...currentResult }));
  savedButton.textContent = savedCount;

  try {
    startWeaving();
    if (dialog.open) dialog.close();
  } finally {
    button.disabled = false;
    button.textContent = 'Сохранить и начать';
  }
});

const keychainSteps = [
  { stage: 'Подготовка', title: 'Подготовь материалы', text: 'Отмерь и отрежь 4 рабочие нити по расчёту. Подготовь кольцо или карабин, ножницы и сантиметр.', tip: 'Не подравнивай нити короче расчёта: запас понадобится при завершении.', help: 'Разложи нити рядом и ещё раз сверь длину каждой со схемой нарезки.', visual: 'threads' },
  { stage: 'Крепление', title: 'Закрепи нити на кольце', text: 'Сложи каждую нить пополам и по очереди закрепи на кольце узлом «жаворонок».', tip: 'Все петли должны смотреть в одну сторону.', help: 'Сгиб нити проведи под кольцо, протяни два конца через петлю и аккуратно затяни.', visual: 'ring' },
  { stage: 'Основа', title: 'Распредели рабочие концы', text: 'Расправь концы, выровняй натяжение и раздели их на рабочие группы.', tip: 'Закрепи кольцо на рабочей поверхности, чтобы плетение не перекручивалось.', help: 'Если концы разной длины, подтяни крепёжные узлы, пока начало изделия не станет ровным.', visual: 'divide' },
  { stage: 'Узел 1', title: 'Завяжи первый плоский узел', text: 'Выбери четыре соседних конца и выполни квадратный плоский узел: левый полуузел, затем правый.', tip: 'Затягивай обе половины одинаково — так цепочка останется прямой.', help: 'Две средние нити держи ровно. Крайними нитями последовательно выполни левый и правый полуузел.', visual: 'knot' },
  { stage: 'Плетение', title: 'Продолжи цепочку', text: 'Повторяй плоские узлы, сохраняя одинаковое расстояние и равномерное натяжение.', tip: 'После каждых трёх узлов проверяй, не уходит ли полотно в сторону.', help: 'Если цепочка закручивается, проверь чередование полуузлов и слегка ослабь последний узел.', visual: 'chain' },
  { stage: 'Контроль', title: 'Проверь длину изделия', text: 'Измерь плетёную часть от кольца. Продолжай, пока общая длина не достигнет размера проекта.', tip: 'Оставь свободные концы для закрепляющего узла и кисточки.', help: 'Прикладывай сантиметр без натяжения. Измеряй изделие в том положении, в котором оно будет использоваться.', visual: 'measure' },
  { stage: 'Завершение', title: 'Сделай закрепляющий узел', text: 'Собери концы вместе и закрепи их обмоточным узлом. Хвост рабочей нити спрячь под витки.', tip: 'Витки укладывай плотно, но не перетягивай основу.', help: 'Сделай петлю вдоль пучка, обмотай его сверху вниз 4–6 раз и протяни конец в петлю.', visual: 'wrap' },
  { stage: 'Финиш', title: 'Подровняй и проверь брелок', text: 'Подрежь концы до одной длины, при желании расчеши кисточку и проверь прочность всех узлов.', tip: 'Готово — осталось сообщить, насколько точным оказался расход шнура.', help: 'Потяни изделие за кольцо и кисточку. Ни один узел не должен смещаться или распускаться.', visual: 'finish' }
];

function genericSteps(project) {
  return [
    { stage: 'Подготовка', title: 'Подготовь материалы', text: `Нарежь нити по схеме для проекта «${project.title}» и разложи их по группам.`, tip: 'Подпиши группы нитей, чтобы не перепутать длины.', help: 'Сверяй количество и длину нитей с карточкой проекта.', visual: 'threads' },
    { stage: 'Основа', title: 'Закрепи основные нити', text: 'Равномерно закрепи нити на основе и выровняй свободные концы.', tip: 'Перед плетением проверь симметрию.', help: 'Начинай крепление от центра и двигайся к краям.', visual: 'ring' },
    { stage: 'Плетение', title: 'Выполни основной раппорт', text: 'Плети выбранный узор, регулярно сверяя ширину и плотность.', tip: 'Контрольный замер делай после каждого ряда.', help: 'Если полотно стягивается, немного ослабь крайние рабочие нити.', visual: 'knot' },
    { stage: 'Контроль', title: 'Проверь размеры', text: 'Сравни текущую ширину и высоту с расчётом проекта.', tip: 'Не обрезай остатки до финальной проверки.', help: 'Измеряй изделие на ровной поверхности без растяжения.', visual: 'measure' },
    { stage: 'Финиш', title: 'Закрепи и оформи изделие', text: 'Зафиксируй последние узлы, спрячь или подровняй концы.', tip: 'Проверь прочность каждого крепления.', help: 'Сначала заверши все узлы и только потом подрезай нити.', visual: 'finish' }
  ];
}

let activeSteps = keychainSteps;

const keychainVideoMeta = [
  { duration: '0:25', transcript: 'Подготавливаем кольцо и рабочие нити, раскладываем материалы перед началом плетения.' },
  { duration: '0:41', transcript: 'Крупным планом складываем нити пополам и закрепляем их на кольце.' },
  { duration: '1:09', transcript: 'Выровняем четыре конца, распределим центральные и рабочие нити и подготовим их к первому узлу.' },
  { duration: '0:56', transcript: 'Пошагово выполняем первый квадратный плоский узел и контролируем натяжение.' },
  { duration: '1:40', transcript: 'Продолжаем цепочку плоских узлов; повторяющиеся участки сокращены, чтобы быстрее перейти к результату.' },
  { duration: '0:38', transcript: 'Проверяем длину плетёной части и определяем место завершения основной цепочки.' },
  { duration: '0:54', transcript: 'Закрепляем свободные концы и аккуратно затягиваем завершающий узел.' },
  { duration: '0:22', transcript: 'Подрезаем концы и показываем готовый брелок со всех сторон.' }
];

function renderVideoLesson(step) {
  const number = String(currentStep + 1).padStart(2, '0');
  const fileName = `${selected.id}-step-${number}.mp4`;
  const meta = selected.id === 'keychain'
    ? keychainVideoMeta[currentStep]
    : { duration: 'до 2 минут', transcript: `В видео показываем этап «${step.title}» крупным планом и без ускорения.` };

  lessonVideo.hidden = true;
  videoPlaceholder.hidden = false;
  document.querySelector('#videoLessonTitle').textContent = step.title;
  document.querySelector('#videoDuration').textContent = meta.duration;
  document.querySelector('#videoTranscript').textContent = meta.transcript;
  document.querySelector('#videoFileHint').textContent = `Файл: videos/${fileName}`;

  try {
    lessonVideo.pause();
    lessonVideo.src = `videos/${fileName}`;
    lessonVideo.load();
  } catch (error) {
    lessonVideo.hidden = true;
    videoPlaceholder.hidden = false;
  }
}

lessonVideo.addEventListener('loadeddata', () => {
  lessonVideo.hidden = false;
  videoPlaceholder.hidden = true;
});

lessonVideo.addEventListener('error', () => {
  lessonVideo.hidden = true;
  videoPlaceholder.hidden = false;
});

function startWeaving() {
  currentStep = 0;
  activeSteps = selected.id === 'keychain' ? keychainSteps : genericSteps(selected);
  topbar.hidden = true;
  homeMain.hidden = true;
  weavingScreen.hidden = false;
  document.querySelector('#weavingProjectName').textContent = `${selected.title} ${currentResult.width} × ${currentResult.height} см`;
  document.querySelector('#weavingFacts').innerHTML = `
    <span><b>${currentResult.total.toFixed(1).replace('.', ',')} м</b> шнура</span>
    <span><b>${currentResult.groups.reduce((sum, group) => sum + group.count, 0)}</b> нитей</span>
    <span><b>${timeLabel(currentResult.time)}</b> примерно</span>`;
  document.querySelector('#stepList').innerHTML = activeSteps.map((step, index) => `<button type="button" data-step-index="${index}"><i>${index + 1}</i><span>${step.stage}</span></button>`).join('');
  renderStep();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderStep() {
  const step = activeSteps[currentStep];
  const percent = Math.round(((currentStep + 1) / activeSteps.length) * 100);
  document.querySelector('#stepCounter').textContent = `Шаг ${currentStep + 1} из ${activeSteps.length}`;
  document.querySelector('#progressPercent').textContent = `${percent}%`;
  document.querySelector('#progressBar').style.width = `${percent}%`;
  document.querySelector('#stepEyebrow').textContent = step.stage;
  document.querySelector('#stepTitle').textContent = step.title;
  document.querySelector('#stepDescription').textContent = step.text;
  document.querySelector('#stepTip').innerHTML = `<strong>Обрати внимание</strong><span>${step.tip}</span>`;
  document.querySelector('#helpText').textContent = step.help;
  document.querySelector('#helpPanel').hidden = true;
  window.setTimeout(() => renderVideoLesson(step), 0);
  document.querySelector('#stepVisual').className = `step-visual visual-${step.visual}`;
  document.querySelector('#previousStepButton').disabled = currentStep === 0;
  document.querySelector('#nextStepButton').textContent = currentStep === activeSteps.length - 1 ? 'Завершить изделие' : 'Шаг готов';
  document.querySelectorAll('#stepList button').forEach((button, index) => {
    button.classList.toggle('active', index === currentStep);
    button.classList.toggle('done', index < currentStep);
  });
}

document.querySelector('#nextStepButton').addEventListener('click', () => {
  if (currentStep < activeSteps.length - 1) {
    currentStep += 1;
    renderStep();
  } else {
    finishDialog.showModal();
  }
});

document.querySelector('#previousStepButton').addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

document.querySelector('#stepList').addEventListener('click', event => {
  const button = event.target.closest('[data-step-index]');
  if (!button) return;
  currentStep = Number(button.dataset.stepIndex);
  renderStep();
});

document.querySelector('#helpButton').addEventListener('click', () => {
  window.open('https://web.max.ru/18453513', '_blank', 'noopener,noreferrer');
});

document.querySelector('#exitWeavingButton').addEventListener('click', () => {
  weavingScreen.hidden = true;
  homeMain.hidden = false;
  topbar.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('#closeFinishButton').addEventListener('click', () => finishDialog.close());

document.querySelector('#feedbackForm').addEventListener('submit', event => {
  event.preventDefault();
  const cordResult = document.querySelector('#cordResult').value;
  if (!cordResult) return;
  let reports = [];
  try {
    reports = JSON.parse(storageGet('macrameReports', '[]'));
    if (!Array.isArray(reports)) reports = [];
  } catch (error) {
    reports = [];
  }
  reports.push({
    project: selected.id,
    cordResult,
    differenceCm: Number(document.querySelector('#cordDifference').value || 0),
    note: document.querySelector('#feedbackNote').value,
    hasPhoto: document.querySelector('#feedbackPhoto').files.length > 0,
    createdAt: new Date().toISOString()
  });
  storageSet('macrameReports', JSON.stringify(reports));
  finishDialog.close();
  toast.textContent = 'Результат сохранён. Проект завершён!';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
});
