#!/usr/bin/env python3
"""Fusionne des interventions.jsonl en un CSV (UTF-8 avec BOM, ouvrable dans Excel/Sheets).

Usage: python3 4_exporter.py impots/interventions.jsonl dge/interventions.jsonl -o auditions.csv
"""
import argparse
import csv
import json

COLS = ["id", "video", "t_debut", "t_fin", "intervenant", "role", "type", "theme",
        "resume", "chiffres", "repond_a", "confiance", "lien", "verifie"]

ap = argparse.ArgumentParser()
ap.add_argument("fichiers", nargs="+")
ap.add_argument("-o", "--sortie", default="auditions.csv")
a = ap.parse_args()
with open(a.sortie, "w", newline="", encoding="utf-8-sig") as out:
    w = csv.DictWriter(out, fieldnames=COLS, extrasaction="ignore")
    w.writeheader()
    for fich in a.fichiers:
        for ligne in open(fich, encoding="utf-8"):
            r = json.loads(ligne)
            r["chiffres"] = " ; ".join(r.get("chiffres") or [])
            r["verifie"] = ""  # colonne à remplir à la relecture
            w.writerow(r)
print("OK ->", a.sortie)
