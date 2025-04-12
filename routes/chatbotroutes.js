const express = require('express');
const axios = require('axios');
const router = express.Router();
const Challenge = require('../models/Challenge');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 🔍 Keyword-based filtering
    const lowerMsg = message.toLowerCase();
    const filter = {};

    if (lowerMsg.includes('shalwar')) {
      filter.title = /shalwar/i;
    } else if (lowerMsg.includes('kurti')) {
      filter.title = /kurti/i;
    } else if (lowerMsg.includes('eid')) {
      filter.title = /eid/i;
    } else if (lowerMsg.includes('sherwani')) {
      filter.title = /sherwani/i;
    } else if (lowerMsg.includes('junaid') || lowerMsg.includes('jj') || lowerMsg.includes('jamshed')) {
      filter.organization = /junaid jamshed/i;
    }

    // 🛒 Get matching challenges
    const challenges = await Challenge.find(filter).limit(5);

    if (!challenges.length) {
      return res.status(200).json({
        reply: "Sorry, I couldn't find any matching challenges."
      });
    }

    // 🧠 Format the challenge list for Gemini
    const challengeList = challenges.map((p, i) => {
      return `${i + 1}. <strong>${p.title}</strong> (Organization: ${p.organization})<br/>
       Description: ${p.description}<br/>
       Price: ${p.price} PKR<br/>
       Image: ${p.images && p.images[0]
          ? `<img src="${p.images[0]}" alt="${p.title}" style="max-width: 100px;" />`
          : 'Image not available'
        }`;
    }).join('<br/><br/>');

    const prompt = `
You are a detailed and pakistan which speaks both urdu and english  and helpful shopping assistant for ecoTrack, an online store for traditional and stylish South Asian fashion.

Here are some matching challenges from our inventory:

${challengeList}

Respond to the user’s message in full, with helpful, engaging, and complete sentences. Mention challenge names, prices, and descriptions where useful. Include image too.

User: "${message}"
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2048, // Extend output length
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          stopSequences: []
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  }
});

module.exports = router;
