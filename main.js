/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/posts.js
const posts = [];
/* harmony default export */ const js_posts = (posts);
;// CONCATENATED MODULE: ./src/js/Post.js
class Post {
  constructor(date, content, coords) {
    this.date = date;
    this.content = content;
    this.coords = coords;
  }
}
;// CONCATENATED MODULE: ./src/js/Tooltip.js
class Tooltip {
  constructor() {
    this.tooltips = [];
    this.errors = {
      coords: {
        valueMissing: 'Введите координаты',
        patternMismatch: 'Неправильный формат координат'
      }
    };
  }

  // Создаем подсказку
  renderTooltip(message, input) {
    const tooltipEl = document.createElement('div');
    tooltipEl.classList.add('message__tooltip');
    tooltipEl.textContent = message;
    const id = performance.now();
    this.tooltips.push({
      id,
      element: tooltipEl
    });
    const {
      left,
      bottom
    } = input.getBoundingClientRect();
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${bottom}px`;
    document.body.append(tooltipEl);
    return id;
  }

  // Удаляем подсказку
  removeTooltip(id) {
    const tooltip = this.tooltips.find(obj => obj.id === id);
    tooltip.element.remove();
    this.tooltips = this.tooltips.filter(obj => obj.id !== id);
  }
}
;// CONCATENATED MODULE: ./src/js/Popover.js

class Popover {
  constructor() {
    this.popover = null;
    this.tooltip = new Tooltip();
    this.actualTooltips = [];
    this.showTooltip = this.showTooltip.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.closePopover = this.closePopover.bind(this);
  }

  // Открываем popover
  showPopover() {
    if (this.popover) return;
    this.drawPopover();
    this.form = this.popover.querySelector('.message__form');
    this.inputCoords = this.form.querySelector('[name="coords"]');
    this.btnSave = this.form.querySelector('.message__btn-save');
    this.btnCancel = this.form.querySelector('.message__btn-cancel');
    this.addEvents();
  }
  drawPopover() {
    this.popover = document.createElement('div');
    this.popover.classList.add('message');
    this.popover.innerHTML = `
      <div class="message__container">
        <p>Что-то пошло не так</p>
        <p>К сожалению, не удалось определить ваше местоположение, пожалуйста,
          дайте разрешение на использование геолокации, либо введите координаты вручную.
        </p>
        <form class="message__form">
          <input name="coords" class="message__input" placeholder="пример: [51.50851, -0.12572]" pattern="^\\[?(-?\\d+\\.\\d+), ?(-? ?\\d+\\.\\d+)\\]?$" required> 
          <div class="message__buttons">
            <button type="button" class="message__btn message__btn-cancel">Отмена</button>
            <button class="message__btn message__btn-save">OK</button>
          </div>
        </form>
      </div>
    `;
    document.body.append(this.popover);
  }

  // Добавляем обработчики событий
  addEvents() {
    this.form.addEventListener('submit', this.saveItem);
    this.inputCoords.addEventListener('input', this.showTooltip);
    this.btnCancel.addEventListener('click', this.closePopover);
  }

  // Показываем подсказку
  showTooltip(e) {
    const {
      target
    } = e;
    const existingTooltip = this.actualTooltips.find(tip => tip.name === target.name);
    const currentError = this.getError(target);

    // Если есть уже такая же ошибка, ничего не меняем
    if (existingTooltip && existingTooltip.error === currentError) {
      return;
    }

    // Если есть подсказка, но ошибка другая, удаляем старую подсказку
    if (existingTooltip) {
      this.tooltip.removeTooltip(existingTooltip.id);
      this.actualTooltips = this.actualTooltips.filter(tip => tip.name !== target.name);
    }

    // Если есть новая ошибка, создаем новую подсказку
    if (currentError) {
      this.createTooltip(target, currentError);
    }
  }

  // Создаем подсказку
  createTooltip(el, errorText) {
    this.actualTooltips.push({
      name: el.name,
      id: this.tooltip.renderTooltip(errorText, el),
      error: errorText
    });
  }

  // Находим тип ошибки
  getError(el) {
    const errorKey = Object.keys(ValidityState.prototype).find(key => {
      if (!el.name) return false;
      if (key === 'valid') return false;
      return el.validity[key];
    });
    if (!errorKey) return null;
    return this.tooltip.errors[el.name][errorKey];
  }

  // Публикуем пост при отправке формы popover
  saveItem(e) {
    e.preventDefault();
    const {
      value
    } = this.inputCoords;
    if (this.actualTooltips.length > 0) {
      this.actualTooltips.forEach(tip => this.tooltip.removeTooltip(tip.id));
      this.actualTooltips = [];
    }
    const {
      elements
    } = this.form;
    const hasInvalidInput = [...elements].some(el => {
      const error = this.getError(el);
      if (error) {
        this.createTooltip(el, error);
        return true;
      }
      return false;
    });
    if (hasInvalidInput) return;
    this.publish(value);
    this.closePopover();
  }

  // Удаляем popover
  closePopover() {
    if (this.actualTooltips.length > 0) {
      this.actualTooltips.forEach(tip => this.tooltip.removeTooltip(tip.id));
      this.actualTooltips = [];
    }
    this.popover.remove();
    this.popover = null;
  }

  // Создаем сообщение об ошибке
  showMessage(text) {
    this.message = document.createElement('div');
    this.message.classList.add('message');
    this.message.innerHTML = `
      <div class="message__container">
        <p>${text}</p>
        <button class="message__btn message__btn-ok">OK</button>
      </div>
    `;
    document.body.append(this.message);
    this.btnOk = this.message.addEventListener('click', () => {
      this.message.remove();
    });
  }
}
;// CONCATENATED MODULE: ./src/js/Timeline.js



class Timeline {
  constructor() {
    this.container = null;
    this.publishPost = this.publishPost.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.popover = new Popover();
    this.popover.publish = this.publishPost;
  }
  init() {
    this.bindToDom();
    this.registerEvents();
  }
  bindToDom() {
    this.container = document.querySelector('.timeline__container');
    this.postsContainer = this.container.querySelector('.timeline__posts');
    this.formForPost = this.container.querySelector('.timeline__form');
    this.btnAudio = this.container.querySelector('.timeline__btn-audio');
    this.btnVideo = this.container.querySelector('.timeline__btn-video');
  }
  registerEvents() {
    this.formForPost.addEventListener('submit', e => this.createPost(e));
    this.btnAudio.addEventListener('click', async () => this.startRecord('audio'));
    this.btnVideo.addEventListener('click', () => this.startRecord('video'));
  }

  // Создаем новый пост
  createPost(e) {
    e.preventDefault();
    const {
      target
    } = e;
    const {
      value
    } = target.querySelector('.timeline__input');
    this.content = {
      type: 'text',
      data: value
    };
    this.getCoords();
  }

  // Запрашиваем разрешение на доступ к геолокации и публикуем пост
  // Если пользователь не разрешил, то показываем всплывающее окно
  getCoords() {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }
    const success = position => {
      const {
        longitude,
        latitude
      } = position.coords;
      const coords = `[${latitude}, -${longitude}]`;
      this.publishPost(coords);
    };
    const error = () => {
      this.popover.showPopover();
    };
    navigator.geolocation.getCurrentPosition(success, error);
  }

  // Создаем объект поста, отрисовываем его и очищаем форму
  publishPost(coords) {
    const date = this.getTimestamp();
    const post = new Post(date, this.content, coords);
    js_posts.push(post);
    this.renderPosts();
    this.formForPost.reset();
  }

  // Форматируем дату
  getTimestamp() {
    return `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`;
  }

  // Рендерим посты
  renderPosts() {
    [...this.postsContainer.querySelectorAll('.post')].forEach(post => post.remove());
    js_posts.forEach(post => this.renderItem(post));
  }

  // Создаем HTML элемент поста
  renderItem(_ref) {
    let {
      date,
      content,
      coords
    } = _ref;
    const {
      type,
      data
    } = content;
    const postContent = type !== 'text' ? `<${type} src="${data}" class="post__${type}" controls></${type}>` : data;
    const post = document.createElement('div');
    post.classList.add('post');
    post.innerHTML = `
      <div class="post__timestamp">
        <span class="post__timestamp-icon">
          <img src="./images/calendar.svg" alt="">
        </span>
        ${date}
      </div>
      <div class="post__content">${postContent}</div>
      <div class="post__geolocation">
        <div class="post__coords">${coords}</div>
          <div class="post__geolocation-icon">
            <img src="./images/geo.svg" alt="">
          </div>
      </div> 
    `;
    this.postsContainer.prepend(post);
  }

  // Отображаем кнопки записи и время записи
  showRecordBtns() {
    this.btns = this.formForPost.querySelector('.timeline__buttons');
    this.btns.classList.add('timeline__buttons_hidden');
    this.record = document.createElement('div');
    this.record.classList.add('timeline__record', 'record');
    this.record.innerHTML = `
      <button type="button" class="timeline__btn record__send">
        <img src="./images/send.svg" alt="">
      </button>
      <div class="record__timer">00:00</div>
      <button type="button" class="timeline__btn record__cancel">
        <img src="./images/cancel.svg" alt="">
      </button>
    `;
    this.formForPost.append(this.record);
    this.timer = this.record.querySelector('.record__timer');
    this.btnSendRecord = this.record.querySelector('.record__send');
    this.btnCancelRecord = this.record.querySelector('.record__cancel');
    this.btnCancelRecord.addEventListener('click', () => {
      if (this.video) this.video.remove();
      this.stopRecord();
    });
  }

  // При клике по кнопке аудио/видео начинаем запись, запускаем время
  async startRecord(typeRecord) {
    this.showRecordBtns();
    const obj = typeRecord === 'video' ? {
      video: true,
      audio: true
    } : {
      audio: true
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(obj);
      const recorder = new MediaRecorder(stream);
      if (typeRecord === 'video') {
        this.video = document.createElement('video');
        this.video.classList.add('timeline__video');
        this.video.muted = true;
        this.postsContainer.prepend(this.video);
        this.video.srcObject = stream;
        this.video.addEventListener('canplay', () => {
          this.video.play();
        });
      }
      const chunks = [];
      recorder.addEventListener('start', () => {
        console.log('start');
      });
      recorder.addEventListener('dataavailable', event => {
        chunks.push(event.data);
      });
      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks);
        this.content = {
          type: typeRecord,
          data: URL.createObjectURL(blob)
        };
        this.getCoords();
      });
      recorder.start();
      this.seconds = 0;
      this.minutes = 0;
      this.timerId = setTimeout(this.updateTimer, 1000);

      // При клике по кнопке отправить, останавливаем запись
      this.btnSendRecord.addEventListener('click', () => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        if (this.video) this.video.remove();
        this.stopRecord();
      });
    } catch (error) {
      this.stopRecord();
      if (error.name === 'NotAllowedError') {
        this.popover.showMessage('Необходимо дать разрешение, чтобы осуществить запись видео/аудио');
      }
      if (error.name === 'NotFoundError') {
        this.popover.showMessage('К сожалению, у Вас нет подключенных устройств видео/аудио');
      }
    }
  }

  // Обновляем время записи
  updateTimer() {
    clearTimeout(this.timerId);
    this.seconds++;
    if (this.seconds === 60) {
      this.seconds = 0;
      this.minutes++;
      if (this.minutes === 60) return;
    }
    // Отображаем значения в формате MM:SS
    const timeString = `${`0${this.minutes}`.slice(-2)}:${`0${this.seconds}`.slice(-2)}`;
    this.timer.textContent = timeString;
    setTimeout(this.updateTimer, 1000);
  }

  // Сбрасываем таймаут, удаляем кнопки записи
  stopRecord() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.record.remove();
    this.btns.classList.remove('timeline__buttons_hidden');
  }
}
;// CONCATENATED MODULE: ./src/js/app.js

const app = new Timeline();
app.init();
;// CONCATENATED MODULE: ./src/index.js


/******/ })()
;
//# sourceMappingURL=main.js.map