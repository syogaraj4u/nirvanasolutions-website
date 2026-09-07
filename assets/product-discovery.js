(() => {
  const controls = document.querySelector('[data-product-filters]');
  const grid = document.querySelector('#product-list');
  const products = [...document.querySelectorAll('#product-list [data-platform]')];
  if (!controls || !grid || !products.length) return;
  const buttons = [...controls.querySelectorAll('[data-product-filter]')];
  const status = controls.querySelector('[role="status"]');
  const select = (button) => {
    const platform = button.dataset.productFilter;
    grid.dataset.filter = platform;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    products.forEach((product) => {
      product.hidden = platform !== 'all' && product.dataset.platform !== platform;
      if (!product.hidden) {
        count += 1;
        // Filtering must not depend on the separate animation script.
        product.classList.add('is-visible');
      }
    });
    status.textContent = `${count} ${count === 1 ? 'product' : 'products'} shown`;
  };
  buttons.forEach((button) => button.addEventListener('click', () => select(button)));
  controls.hidden = false;
})();
