//default settings
const defaultSettings = {
  refreshRate: 3000,
  threshold: 0.95,
  notificationFrequency: 50000,
  lastNotification: 0,
};

// Track items in storage
exports.storage =
  JSON.parse(localStorage.getItem("saved-settings")) || defaultSettings;

exports.save = () => {
  localStorage.setItem("saved-settings", JSON.stringify(this.storage));
};
