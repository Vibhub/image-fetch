// fetch-images.js
import fs from 'fs';
import axios from 'axios';

const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const orientation = 'portrait';
const perPage = 30;

const categories = [
  'daily',
  'motivational',
  'love',
  'happiness',
  'positive',
  'strength'
];

async function fetchImagesForCategory(category) {
  const query = `minimal,gradient,abstract,${category}`;
  const url = `https://api.unsplash.com/search/photos?query=${query}&orientation=${orientation}&per_page=${perPage}&client_id=${accessKey}`;

  try {
    const res = await axios.get(url);
    return res.data.results.map(img => ({
      url: img.urls.regular,
      author: img.user.name,
      link: img.links.html,
      alt: img.alt_description,
      category
    }));
  } catch (err) {
    console.error(`Error fetching for category "${category}":`, err.message);
    return [];
  }
}

async function fetchAll() {
  const dateStr = new Date().toISOString().slice(0, 10);
  const allResults = {};

  for (const category of categories) {
    const images = await fetchImagesForCategory(category);
    allResults[category] = images;
    const filePath = `daily-images/${dateStr}-${category}.json`;
    fs.writeFileSync(filePath, JSON.stringify(images, null, 2));
    console.log(`Saved ${images.length} images to ${filePath}`);
  }
}

fetchAll();
