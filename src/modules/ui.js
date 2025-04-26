// Setup menu from config
export function setupMenu(config) {
  const menuTitle = document.getElementById('menu-title');
  const playButton = document.getElementById('play-button');
  const settingsButton = document.getElementById('settings-button');

  // Apply title text and color from config
  menuTitle.textContent = config.menu.title.text;
  menuTitle.style.color = config.menu.title.color;

  // Apply play button text and styles
  playButton.textContent = config.menu.buttons.play.text;
  playButton.style.color = config.menu.buttons.play.color;
  playButton.style.backgroundColor = config.menu.buttons.play.backgroundColor;

  // Apply settings button text and styles
  settingsButton.textContent = config.menu.buttons.settings.text;
  settingsButton.style.color = config.menu.buttons.settings.color;
  settingsButton.style.backgroundColor = config.menu.buttons.settings.backgroundColor;

  // Button event listeners
  playButton.addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
  });

  settingsButton.addEventListener('click', () => {
    alert('Settings not implemented yet');
  });
} 