export default class Tooltip {
  constructor() {
    this.tooltips = [];
    this.errors = {
      coords: {
        valueMissing: 'Введите координаты',
        patternMismatch: 'Неправильный формат координат',
      },
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
      element: tooltipEl,
    });

    const { left, bottom } = input.getBoundingClientRect();

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${bottom}px`;
    document.body.append(tooltipEl);

    return id;
  }

  // Удаляем подсказку
  removeTooltip(id) {
    const tooltip = this.tooltips.find((obj) => obj.id === id);
    tooltip.element.remove();

    this.tooltips = this.tooltips.filter((obj) => obj.id !== id);
  }
}
