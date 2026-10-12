#!/usr/bin/env python3
"""Structure un transcript en interventions question/réponse avec Claude.

Usage:
  ANTHROPIC_API_KEY=... python3 3_structurer.py impots --youtube-id XXXXXXXXXXX \
      --contexte "Audition du DG des Impôts et Domaines, commission des finances"
  python3 3_structurer.py impots --dry-run    # écrit les fenêtres + prompt, sans API
                                              # (à coller à la main dans claude.ai)
Sortie : <dossier>/interventions.jsonl
"""
import argparse
import json
import re
from pathlib import Path

FENETRE, RECOUVREMENT = 900, 120  # secondes
PROMPT = (Path(__file__).parent / "prompt_structuration.md").read_text(encoding="utf-8")


def fenetres(segs: list[dict]):
    fin = segs[-1]["t"] + 1
    pas = FENETRE - RECOUVREMENT
    k = 0
    while k * pas < fin:
        debut = k * pas
        yield k, debut, [s for s in segs if debut <= s["t"] < debut + FENETRE]
        k += 1


def zone(k: int, n: int) -> tuple[float, float]:
    """Plage de t_debut conservée pour la fenêtre k (les zones se jouxtent)."""
    pas = FENETRE - RECOUVREMENT
    lo = 0 if k == 0 else k * pas + RECOUVREMENT / 2
    hi = float("inf") if k == n - 1 else (k + 1) * pas + RECOUVREMENT / 2
    return lo, hi


def parse_json(texte: str) -> list[dict]:
    texte = re.sub(r"^```(?:json)?|```$", "", texte.strip(), flags=re.M)
    return json.loads(texte[texte.index("["): texte.rindex("]") + 1])


def appeler(client, model: str, contexte: str, precedent: list[dict], lignes: str):
    ctx_prec = ""
    if precedent:
        ctx_prec = ("\nInterventions précédentes (pour la continuité des noms et "
                    "repond_a) :\n" + json.dumps(
                        [{k: p[k] for k in ("id", "intervenant", "role", "type", "theme")}
                         for p in precedent], ensure_ascii=False))
    msg = f"Contexte : {contexte}{ctx_prec}\n\nTranscription :\n{lignes}"
    for _ in range(2):
        r = client.messages.create(model=model, max_tokens=8000, system=PROMPT,
                                   messages=[{"role": "user", "content": msg}])
        try:
            return parse_json(r.content[0].text)
        except ValueError:
            continue
    raise SystemExit("Réponse JSON invalide deux fois de suite")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("dossier")
    ap.add_argument("--youtube-id", default="")
    ap.add_argument("--contexte", default="Audition en commission, Assemblée nationale")
    ap.add_argument("--model", default="claude-sonnet-5-5")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    d = Path(a.dossier)
    segs = json.loads((d / "transcript.json").read_text(encoding="utf-8"))
    wins = list(fenetres(segs))

    if a.dry_run:
        (d / "fenetres").mkdir(exist_ok=True)
        for k, debut, ss in wins:
            (d / "fenetres" / f"w{k:02d}.txt").write_text(
                "\n".join(f"[{s['t']}] {s['text']}" for s in ss), encoding="utf-8")
        print(f"{len(wins)} fenêtres écrites dans {d}/fenetres (prompt : prompt_structuration.md)")
        return

    import anthropic
    client = anthropic.Anthropic()
    toutes: list[dict] = []
    for k, debut, ss in wins:
        print(f"fenêtre {k + 1}/{len(wins)}", flush=True)
        lignes = "\n".join(f"[{s['t']}] {s['text']}" for s in ss)
        items = appeler(client, a.model, a.contexte, toutes[-5:], lignes)
        locaux = {i["id"] for i in items}
        lo, hi = zone(k, len(wins))
        for i in items:
            if not lo <= i["t_debut"] < hi:
                continue
            i["id"] = f"{d.name}-{k}-{i['id']}"
            if i.get("repond_a") in locaux:
                i["repond_a"] = f"{d.name}-{k}-{i['repond_a']}"
            i["video"] = d.name
            i["lien"] = f"https://youtu.be/{a.youtube_id}?t={i['t_debut']}" if a.youtube_id else ""
            toutes.append(i)
    with open(d / "interventions.jsonl", "w", encoding="utf-8") as f:
        for i in toutes:
            f.write(json.dumps(i, ensure_ascii=False) + "\n")
    print(f"OK : {len(toutes)} interventions -> {d}/interventions.jsonl")


if __name__ == "__main__":
    main()
