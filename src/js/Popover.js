import Tooltip from './Tooltip';

export default class Popover {
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
    const { target } = e;
    const existingTooltip = this.actualTooltips.find((tip) => tip.name === target.name);
    const currentError = this.getError(target);

    // Если есть уже такая же ошибка, ничего не меняем
    if (existingTooltip && existingTooltip.error === currentError) {
      return;
    }

    // Если есть подсказка, но ошибка другая, удаляем старую подсказку
    if (existingTooltip) {
      this.tooltip.removeTooltip(existingTooltip.id);
      this.actualTooltips = this.actualTooltips.filter((tip) => tip.name !== target.name);
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
      error: errorText,
    });
  }

  // Находим тип ошибки
  getError(el) {
    const errorKey = Object.keys(ValidityState.prototype).find((key) => {
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
    const { value } = this.inputCoords;
    if (this.actualTooltips.length > 0) {
      this.actualTooltips.forEach((tip) => this.tooltip.removeTooltip(tip.id));
      this.actualTooltips = [];
    }

    const { elements } = this.form;
    const hasInvalidInput = [...elements].some((el) => {
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
      this.actualTooltips.forEach((tip) => this.tooltip.removeTooltip(tip.id));
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
