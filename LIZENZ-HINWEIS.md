# Herkunft und Lizenz

Diese Fassung basiert auf [poloclub/transformer-explainer](https://github.com/poloclub/transformer-explainer)
(Georgia Tech, MIT-Lizenz, siehe `LICENSE`). Angepasst für das TechChamps-Lab:

- Oberfläche und Lernkarten auf Deutsch
- offline-fähig: Rechenkern (onnxruntime-web), Tokenizer (`Xenova/gpt2`, MIT) und KaTeX-CSS kommen von der eigenen Adresse
- kein Google Tag Manager, keine Google Fonts, kein langer Erklärartikel
- Basispfad per `BASE_PATH` beim Build (Lab: `/werkzeug/transformer-explainer`)

Build: GitHub Actions (`.github/workflows/build.yml`) erzeugt `explainer-build.tar.gz` im Release `latest`.
