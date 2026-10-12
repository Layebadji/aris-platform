#!/usr/bin/env python3
"""Transcrit les morceaux audio d'un dossier avec Groq (whisper-large-v3).

Usage: GROQ_API_KEY=... python3 2_transcrire.py impots [--vocab vocab_dgid.txt]
Produit <dossier>/transcript.json ([{"t": secondes, "text": ...}]) et transcript.txt.
Reprise possible : chaque morceau déjà transcrit (part_XXX.json) est réutilisé.
"""
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

from groq import Groq, RateLimitError

MODEL = "whisper-large-v3"
VOCAB = ""


def duree(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def transcrire(client: Groq, path: Path) -> list[dict]:
    cache = path.with_suffix(".json")
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    for tentative in range(8):
        try:
            with open(path, "rb") as f:
                r = client.audio.transcriptions.create(
                    file=(path.name, f.read()), model=MODEL, language="fr",
                    temperature=0, prompt=VOCAB, response_format="verbose_json")
            break
        except RateLimitError:
            attente = 60 * (tentative + 1)
            print(f"  limite de débit atteinte, pause {attente}s", flush=True)
            time.sleep(attente)
    else:
        sys.exit(f"Échec répété sur {path.name}")
    data = r if isinstance(r, dict) else r.model_dump()
    segs = data.get("segments") or (data.get("model_extra") or {}).get("segments") or []
    cache.write_text(json.dumps(segs, ensure_ascii=False), encoding="utf-8")
    return segs


def nettoyer(segs: list[dict]) -> list[dict]:
    """Écarte les hallucinations classiques (silence, boucles de répétition)."""
    out, repet = [], 0
    for s in segs:
        txt = s["text"].strip()
        if not txt or s.get("no_speech_prob", 0) > 0.9:
            continue
        if out and txt == out[-1]["text"]:
            repet += 1
            if repet >= 2:
                continue
        else:
            repet = 0
        out.append({"t": s["t"], "text": txt})
    return out


def main(dossier: str) -> None:
    d = Path(dossier)
    parts = sorted(d.glob("part_*.ogg"))
    if not parts:
        sys.exit(f"Aucun part_*.ogg dans {d}")
    client = Groq()
    tout, offset = [], 0.0
    for p in parts:
        print(f"{p.name} (début à {int(offset)}s)", flush=True)
        for s in transcrire(client, p):
            tout.append({"t": int(s["start"] + offset), "text": s["text"],
                         "no_speech_prob": s.get("no_speech_prob", 0)})
        offset += duree(p)
    tout = nettoyer(tout)
    (d / "transcript.json").write_text(
        json.dumps(tout, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(d / "transcript.txt", "w", encoding="utf-8") as f:
        for s in tout:
            h, m, sec = s["t"] // 3600, s["t"] % 3600 // 60, s["t"] % 60
            f.write(f"[{h:02d}:{m:02d}:{sec:02d}] {s['text']}\n")
    print(f"OK : {len(tout)} segments -> {d}/transcript.json")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("dossier")
    ap.add_argument("--vocab", default=str(Path(__file__).parent / "vocab.txt"),
                    help="fichier de vocabulaire (noms propres, sigles) passé à Whisper")
    a = ap.parse_args()
    VOCAB = Path(a.vocab).read_text(encoding="utf-8").strip()
    main(a.dossier)
