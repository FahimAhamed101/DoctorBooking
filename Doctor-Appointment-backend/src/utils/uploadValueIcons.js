const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const iconsToUpload = [
  {
    local: path.join(__dirname, '../../../doctor-appointment-client/public/icons/award.svg'),
    public_id: 'award',
    folder: 'doctor-booking/values',
    matchName: /Clinical Excellence/i
  },
  {
    local: path.join(__dirname, '../../../doctor-appointment-client/public/icons/shield-check.svg'),
    public_id: 'shield-check',
    folder: 'doctor-booking/values',
    matchName: /Privacy & Trust/i
  },
  {
    local: path.join(__dirname, '../../../doctor-appointment-client/public/icons/laptop-medical.svg'),
    public_id: 'laptop-medical',
    folder: 'doctor-booking/values',
    matchName: /Digital Healthcare/i
  },
  {
    local: path.join(__dirname, '../../../doctor-appointment-client/public/icons/heart-pulse.svg'),
    public_id: 'heart-pulse',
    folder: 'doctor-booking/values',
    matchName: /Compassion/i
  }
];

(async () => {
  try {
    console.log('Uploading value icons to Cloudinary...');
    const uploaded = {};
    for (const item of iconsToUpload) {
      const res = await cloudinary.uploader.upload(item.local, {
        folder: item.folder,
        public_id: item.public_id,
        resource_type: 'image',
        overwrite: true
      });
      console.log(`Uploaded ${item.public_id} -> ${res.secure_url}`);
      uploaded[item.public_id] = res.secure_url;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    const db = mongoose.connection.db;

    for (const item of iconsToUpload) {
      const iconUrl = uploaded[item.public_id];
      if (iconUrl) {
        const result = await db.collection('values').updateOne(
          { name: item.matchName },
          { $set: { icon: iconUrl } }
        );
        console.log(`Updated value matching ${item.matchName} with ${iconUrl} (modified: ${result.modifiedCount})`);
      }
    }

    console.log('All values updated successfully in MongoDB Atlas!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in uploadValueIcons:', err);
    process.exit(1);
  }
})();
