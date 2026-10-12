# Pipeline audition en commission

Prérequis : `ffmpeg`, Python 3, `pip install -r requirements.txt`, clés `GROQ_API_KEY` et `ANTHROPIC_API_KEY`.
Avant de lancer : compléter `vocab.txt` (noms des députés et directeurs, sigles).

```bash
./1_decouper.sh video_impots.mp4 impots                 # audio compressé, morceaux de 20 min
python3 2_transcrire.py impots                          # -> impots/transcript.json + .txt
python3 3_structurer.py impots --youtube-id ID_VIDEO \
  --contexte "Audition du DG des Impôts et Domaines, commission des finances"
                                                        # -> impots/interventions.jsonl
python3 4_exporter.py impots/interventions.jsonl dge/interventions.jsonl -o auditions.csv
```

- `3_structurer.py --dry-run` écrit les fenêtres de texte sans appeler l'API ; on peut les coller avec `prompt_structuration.md` dans claude.ai.
- Colonne `verifie` du CSV : à remplir à la relecture (écoute au lien horodaté), surtout pour les chiffres et les noms.
