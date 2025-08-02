import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ORIENTATION = 'portrait';
const IMAGES_PER_CATEGORY = 30;

const CATEGORY_QUERIES = {
  Daily: ['adventure', 'light', 'abstract', 'calm', 'aesthetic'],
  Wanderlust: ['wanderlust'],
  Motivational: ['success', 'focus', 'runner', 'determination'],
  Love: ['romance', 'couple', 'affection', 'heart'],
  Happiness: ['smile', 'joy', 'cheerful', 'sunshine'],
  Positive: ['hope', 'uplifting', 'sunlight', 'peace'],
  Strength: ['power', 'courage', 'mountain', 'athlete']
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function fetchImagesForCategory(category) {
  const queryPool = CATEGORY_QUERIES[category];
  const query = pickRandom(queryPool);
  const randomPage = Math.floor(Math.random() * 10) + 1;

  const url = `https://api.unsplash.com/search/photos`;
  const params = {
    query,
    orientation: ORIENTATION,
    order_by: 'curated',
    page: randomPage,
    per_page: IMAGES_PER_CATEGORY,
    client_id: UNSPLASH_ACCESS_KEY
  };

  console.log(`📸 Fetching "${category}" with query "${query}" | page ${randomPage}`);

  try {
    const response = await axios.get(url, { params });

    return response.data.results.map(img => ({
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
  } catch (err) {
    throw new Error(`Axios error for ${category}: ${err.message}`);
  }
}

async function fetchAll() {
  const results = {};
  const categories = Object.keys(CATEGORY_QUERIES);

  for (const category of categories) {
    try {
      const images = await fetchImagesForCategory(category);
      results[category] = images;
    } catch (err) {
      console.error(`❌ Error fetching ${category}: ${err.message}`);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, 'daily-images');
  const filePath = path.join(outputDir, `${today}.json`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`✅ Images saved to ${filePath}`);
}

fetchAll();
