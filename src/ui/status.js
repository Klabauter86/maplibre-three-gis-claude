export function createStatus(elementId = 'status') {
  const element = document.getElementById(elementId);
  return {
    set(message, state = 'info') {
      if (!element) return;
      element.textContent = message;
      element.dataset.state = state;
      element.hidden = false;
    },
    hide() {
      if (element) element.hidden = true;
    },
  };
}
