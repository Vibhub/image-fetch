import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ORIENTATION = 'portrait';
const IMAGES_PER_CATEGORY = 30;

const CATEGORY_QUERIES = {
  daily: ['minimal', 'gradient', 'abstract', 'calm', 'aesthetic'],
  motivational: ['success', 'focus', 'runner', 'determination'],
  love: ['romance', 'couple', 'affection', 'heart'],
  happiness: ['smile', 'joy', 'cheerful', 'sunshine'],
  positive: ['hope', 'uplifting', 'sunlight', 'peace'],
  strength: ['power', 'courage', 'mountain', 'athlete']
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function fetchImagesForCategory(category) {
  const queryPool = CATEGORY_QUERIES[category];
  const query = pickRandom(queryPool);
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${ORIENTATION}&order_by=latest&page=${randomPage}&per_page=${IMAGES_PER_CATEGORY}&client_id=${UNSPLASH_ACCESS_KEY}`;

  console.log(`Fetching ${category} images with query "${query}" on page ${randomPage}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${category}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map(img => ({
    id: img.id,
    alt_description: img.alt_description,
    url: img.urls.regular,
    width: img.width,
    height: img.height,
    photographer: {
      name: img.user.name,
      profile: img.user.links.html
    },
    link: img.links.html
  }));
}

async function fetchAll() {
  const results = {};
  const categories = Object.keys(CATEGORY_QUERIES);

  for (const category of categories) {
    try {
      const images = await fetchImagesForCategory(category);
      results[category] = images;
    } catch (err) {
      console.error(`Error fetching ${category}:`, err.message);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join('daily-images');
  const filePath = path.join(outputDir, `${today}.json`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`✅ Saved all images to ${filePath}`);
}

fetchAll();
