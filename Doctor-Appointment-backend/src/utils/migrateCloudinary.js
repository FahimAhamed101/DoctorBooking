const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const filesToUpload = [
  { local: path.join(__dirname, '../../public/uploads/blogs/cardio-health.jpg'), folder: 'doctor-booking/blogs', public_id: 'cardio-health' },
  { local: path.join(__dirname, '../../public/uploads/blogs/pediatric-care.jpg'), folder: 'doctor-booking/blogs', public_id: 'pediatric-care' },
  { local: path.join(__dirname, '../../public/uploads/blogs/allergy-care.jpg'), folder: 'doctor-booking/blogs', public_id: 'allergy-care' },
  { local: path.join(__dirname, '../../public/uploads/users/doctor-1.png'), folder: 'doctor-booking/users', public_id: 'doctor-1' },
  { local: path.join(__dirname, '../../public/uploads/users/doctor-2.png'), folder: 'doctor-booking/users', public_id: 'doctor-2' },
  { local: path.join(__dirname, '../../public/uploads/users/doctor-3.png'), folder: 'doctor-booking/users', public_id: 'doctor-3' },
  { local: path.join(__dirname, '../../public/uploads/users/doctor-4.png'), folder: 'doctor-booking/users', public_id: 'doctor-4' },
  { local: path.join(__dirname, '../../public/uploads/users/user.png'), folder: 'doctor-booking/users', public_id: 'user' },
  { local: path.join(__dirname, '../../public/uploads/users/patient-1.png'), folder: 'doctor-booking/users', public_id: 'patient-1' },
  { local: path.join(__dirname, '../../public/uploads/users/patient-2.png'), folder: 'doctor-booking/users', public_id: 'patient-2' },
  { local: path.join(__dirname, '../../public/uploads/users/patient-3.png'), folder: 'doctor-booking/users', public_id: 'patient-3' },
];

(async () => {
  const uploaded = {};
  for (const item of filesToUpload) {
    try {
      const res = await cloudinary.uploader.upload(item.local, {
        folder: item.folder,
        public_id: item.public_id,
        overwrite: true
      });
      console.log('Uploaded', item.public_id, '->', res.secure_url);
      uploaded[item.public_id] = res.secure_url;
    } catch (err) {
      console.error('Failed to upload', item.local, err.message);
    }
  }

  // Connect to MongoDB to update existing blog and team records
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URL);
  const db = mongoose.connection.db;

  // Update blogs
  if (uploaded['cardio-health']) {
    const r1 = await db.collection('blogs').updateOne(
      { slug: 'understanding-cardiovascular-health-5-daily-habits' },
      { $set: { coverImage: uploaded['cardio-health'] } }
    );
    console.log('Updated cardio-health blog in DB:', r1.modifiedCount);
  }
  if (uploaded['pediatric-care']) {
    const r2 = await db.collection('blogs').updateOne(
      { slug: 'pediatric-immunization-guide-for-parents' },
      { $set: { coverImage: uploaded['pediatric-care'] } }
    );
    console.log('Updated pediatric blog in DB:', r2.modifiedCount);
  }
  if (uploaded['allergy-care']) {
    const r3 = await db.collection('blogs').updateOne(
      { slug: 'managing-seasonal-allergies-treatments' },
      { $set: { coverImage: uploaded['allergy-care'] } }
    );
    console.log('Updated allergy blog in DB:', r3.modifiedCount);
  }

  // Update teams
  if (uploaded['doctor-1']) {
    const d1 = await db.collection('teams').updateOne(
      { fullName: /Alexander Wright/i },
      { $set: { profileImage: uploaded['doctor-1'] } }
    );
    console.log('Updated doctor-1 in DB:', d1.modifiedCount);
  }
  if (uploaded['doctor-2']) {
    const d2 = await db.collection('teams').updateOne(
      { fullName: /Sophia Martinez/i },
      { $set: { profileImage: uploaded['doctor-2'] } }
    );
    console.log('Updated doctor-2 in DB:', d2.modifiedCount);
  }
  if (uploaded['doctor-3']) {
    const d3 = await db.collection('teams').updateOne(
      { fullName: /Marcus Chen/i },
      { $set: { profileImage: uploaded['doctor-3'] } }
    );
    console.log('Updated doctor-3 in DB:', d3.modifiedCount);
  }
  if (uploaded['doctor-4']) {
    const d4 = await db.collection('teams').updateOne(
      { fullName: /Rachel Green/i },
      { $set: { profileImage: uploaded['doctor-4'] } }
    );
    console.log('Updated doctor-4 in DB:', d4.modifiedCount);
  }

  // Update Users
  if (uploaded['doctor-1']) {
    await db.collection('users').updateOne(
      { email: 'evansceo246@gmail.com' },
      { $set: { profileImage: uploaded['doctor-1'] } }
    );
  }
  if (uploaded['patient-1']) {
    await db.collection('users').updateOne(
      { email: 'user@gmail.com' },
      { $set: { profileImage: uploaded['patient-1'] } }
    );
  }
  if (uploaded['patient-2']) {
    await db.collection('users').updateOne(
      { email: 'david.miller@example.com' },
      { $set: { profileImage: uploaded['patient-2'] } }
    );
  }
  if (uploaded['patient-3']) {
    await db.collection('users').updateOne(
      { email: 'emily.clark@example.com' },
      { $set: { profileImage: uploaded['patient-3'] } }
    );
  }

  console.log('MongoDB records updated successfully with Cloudinary URLs!');
  await mongoose.disconnect();
})();
