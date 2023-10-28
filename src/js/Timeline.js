import posts from './posts';
import Post from './Post';
import Popover from './Popover';

export default class Timeline {
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
    this.formForPost.addEventListener('submit', (e) => this.createPost(e));
    this.btnAudio.addEventListener('click', async () => this.startRecord('audio'));
    this.btnVideo.addEventListener('click', () => this.startRecord('video'));
  }

  // Создаем новый пост
  createPost(e) {
    e.preventDefault();
    const { target } = e;
    const { value } = target.querySelector('.timeline__input');
    this.content = {
      type: 'text',
      data: value,
    };
    this.getCoords();
  }

  // Запрашиваем разрешение на доступ к геолокации и публикуем пост
  // Если пользователь не разрешил, то показываем всплывающее окно
  getCoords() {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    const success = (position) => {
      const { longitude, latitude } = position.coords;
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
    posts.push(post);
    this.renderPosts();
    this.formForPost.reset();
  }

  // Форматируем дату
  getTimestamp() {
    return `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`;
  }

  // Рендерим посты
  renderPosts() {
    [...this.postsContainer.querySelectorAll('.post')].forEach((post) => post.remove());
    posts.forEach((post) => this.renderItem(post));
  }

  // Создаем HTML элемент поста
  renderItem({ date, content, coords }) {
    const { type, data } = content;

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
    const obj = typeRecord === 'video' ? { video: true, audio: true } : { audio: true };
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

      recorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks);
        this.content = {
          type: typeRecord,
          data: URL.createObjectURL(blob),
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
        stream.getTracks().forEach((track) => track.stop());
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
    const timeString = `${(`0${this.minutes}`).slice(-2)}:${(`0${this.seconds}`).slice(-2)}`;

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
