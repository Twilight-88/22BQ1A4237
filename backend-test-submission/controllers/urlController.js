const URL = require('../models/urlModel');
const generateShortCode = require('../utils/shortcodeGenerator');

exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const shortCode = generateShortCode();

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    
    const newUrl = new URL({
      originalUrl,
      shortCode,
    });

    await newUrl.save();

    res.status(201).json({ shortUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.redirectToOriginal = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getStats = async (req, res) => {
  try {
    const urls = await URL.find().sort({ createdAt: -1 });
    const stats = urls.map((url) => ({
      originalUrl: url.originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
      clicks: url.clicks,
    }));
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

