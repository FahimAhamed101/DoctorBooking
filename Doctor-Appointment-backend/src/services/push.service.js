const webpush = require("web-push");


webpush.setVapidDetails(
  "mailto:shadathossan3500@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);


const generateVapidKeys = () => {
  return webpush.generateVAPIDKeys();
};

module.exports = {
  webpush,      
  generateVapidKeys,  
};
