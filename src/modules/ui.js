import { toggleCoinHitboxes } from './coin.js';

// Setup menu from config
export function setupMenu(config, scene, character, trainGenerator, coins) {
  const menuTitle = document.getElementById('menu-title');
  const playButton = document.getElementById('play-button');
  const settingsButton = document.getElementById('settings-button');
  const debugCheckbox = document.getElementById('debug-checkbox');

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

  // Get settings menu elements
  const settingsMenu = document.getElementById('settings-menu');
  const saveSettingsBtn = document.getElementById('save-settings');
  const cancelSettingsBtn = document.getElementById('cancel-settings');
  const musicVolumeSlider = document.getElementById('music-volume');
  const sfxVolumeSlider = document.getElementById('sfx-volume');
  const difficultySelect = document.getElementById('difficulty');

  // Load settings from config if they exist
  if (config.settings) {
    musicVolumeSlider.value = config.settings.musicVolume || 50;
    sfxVolumeSlider.value = config.settings.sfxVolume || 70;
    difficultySelect.value = config.settings.difficulty || 'medium';
  }

  // Set initial debug checkbox state
  debugCheckbox.checked = config.debug.enabled;

  // Setup debug checkbox event listener
  debugCheckbox.addEventListener('change', (e) => {
    config.debug.enabled = e.target.checked;
    config.debug.showHitboxes = e.target.checked;
    
    // Toggle hitboxes for trains if trainGenerator exists
    if (trainGenerator) {
      trainGenerator.toggleHitboxes(config.debug.showHitboxes);
    }
    
    // Toggle hitboxes for coins if coins exist
    if (coins && coins.positions) {
      toggleCoinHitboxes(coins, config.debug.showHitboxes);
    }
    
    // Toggle hitbox for character if it exists
    if (character) {
      character.toggleHitbox(config.debug.showHitboxes, scene);
    }
  });

  // Button event listeners
  playButton.addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
  });

  settingsButton.addEventListener('click', () => {
    settingsMenu.style.display = 'block';
  });

  // Settings menu button listeners
  saveSettingsBtn.addEventListener('click', () => {
    // Save settings to config
    if (!config.settings) config.settings = {};
    
    config.settings.musicVolume = parseInt(musicVolumeSlider.value);
    config.settings.sfxVolume = parseInt(sfxVolumeSlider.value);
    config.settings.difficulty = difficultySelect.value;
    
    // Update game difficulty based on selection
    updateGameDifficulty(config, difficultySelect.value);
    
    // Hide settings menu
    settingsMenu.style.display = 'none';
  });

  cancelSettingsBtn.addEventListener('click', () => {
    // Reset form values to current config
    if (config.settings) {
      musicVolumeSlider.value = config.settings.musicVolume || 50;
      sfxVolumeSlider.value = config.settings.sfxVolume || 70;
      difficultySelect.value = config.settings.difficulty || 'medium';
    }
    
    // Hide settings menu
    settingsMenu.style.display = 'none';
  });
}

// Function to update game difficulty settings
function updateGameDifficulty(config, difficulty) {
  switch(difficulty) {
    case 'easy':
      config.train.spawnRate = 0.005;
      config.character.speed = 15;
      break;
    case 'medium':
      config.train.spawnRate = 0.01;
      config.character.speed = 20;
      break;
    case 'hard':
      config.train.spawnRate = 0.02;
      config.character.speed = 25;
      break;
  }
} 