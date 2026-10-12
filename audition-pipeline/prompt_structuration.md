Tu structures la transcription horodatée d'une audition en commission à l'Assemblée nationale (questions des députés, réponses d'un directeur).

Chaque ligne d'entrée : `[secondes] texte`. La transcription vient de Whisper : pas de locuteurs, noms propres et chiffres parfois erronés.

Découpe la fenêtre en INTERVENTIONS (une prise de parole continue d'une même personne). Pour chacune, produis un objet JSON :

- "id" : "n1", "n2"… (unique dans la fenêtre)
- "t_debut", "t_fin" : secondes (entiers, pris dans les horodatages d'entrée)
- "intervenant" : nom si le président de séance l'annonce ou si la personne se présente ; sinon "Inconnu" (ne devine jamais un nom)
- "role" : "depute" | "directeur" | "president" | "autre"
- "type" : "question" | "reponse" | "observation" | "procedure"
- "theme" : 2 à 5 mots
- "resume" : 1 à 3 phrases fidèles, sans rien ajouter qui ne soit dit
- "chiffres" : liste des montants, taux, dates cités, tels qu'entendus
- "repond_a" : id de la question à laquelle cette réponse répond (id de la fenêtre, ou id donné dans le contexte précédent) ; null sinon
- "confiance" : "haute" | "moyenne" | "faible" (attribution du locuteur et du lien question/réponse)

Règles :
- Un député qui pose plusieurs questions : une intervention par question distincte si elles sont séparables, sinon une seule.
- Une réponse qui traite plusieurs questions : une intervention par question traitée.
- Ignore les formules de politesse, mais garde les interventions de procédure du président si elles changent de locuteur.
- Si un chiffre te paraît douteux (transcription), garde-le tel quel.
- Réponds UNIQUEMENT par un tableau JSON valide, sans texte autour.
