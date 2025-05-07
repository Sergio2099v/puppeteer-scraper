import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { lien } = req.body;
  if (!lien) return res.status(400).send({ error: 'Lien manquant' });

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true
    });
    const page = await browser.newPage();
    await page.goto(lien, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.innerText || 'Inconnu';
      const nom = document.querySelector('title')?.innerText || 'Non trouvé';
      const fournisseur = getText('[class*=supplier-name]');
      const prix = getText('[class*=price]');
      const fraisPort = getText('[class*=shipping]');
      const age = getText('[class*=gold-supplier]');

      return { nom, fournisseur, prix, fraisPort, age };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Scraping échoué', message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur en ligne sur le port ${port}`));
