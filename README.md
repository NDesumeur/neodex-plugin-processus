# Processus

Un gestionnaire des tâches simple dans NeoDex : les programmes qui tournent sur ton PC, regroupés par nom, avec leur part du processeur et leur mémoire, actualisés toutes les 2 secondes. Il montre aussi ce que consomme chaque plugin de NeoDex.

*English version: [README.en.md](README.en.md)*

## Les programmes

- Chaque ligne regroupe tous les processus d'un même programme (par exemple tous ceux d'un navigateur), avec le **processeur** utilisé (en %) et la **mémoire** (en Mo ou Go).
- **Filtrer** : n'affiche que les programmes dont le nom contient ce que tu tapes.
- **Trier** par processeur, par mémoire ou par nom.
- **Fermer** force la fermeture du programme, comme « Fin de tâche » dans le Gestionnaire des tâches de Windows, après confirmation : ce qui n'est pas enregistré dans ce programme est perdu.
- Les programmes indispensables à Windows sont protégés : les fermer pourrait bloquer le PC. Si certains processus refusent de se fermer (il faudrait les droits administrateur), le plugin l'indique.

## Les plugins de NeoDex

La partie **Plugins de NeoDex** liste chaque plugin ouvert :

- son processeur et sa mémoire ;
- ce qu'il a téléchargé depuis le lancement de NeoDex (nombre de requêtes et volume) et sa place sur le disque ;
- **Arrêter** le décharge : il libère sa mémoire et repart quand tu le rouvres.

Plusieurs plugins peuvent partager le même processus ; un plugin qui tourne dans NeoDex lui-même ne peut pas être arrêté ici (il faut le désactiver dans le NeoStore).

## Données et synchronisation

Rien n'est synchronisé : le plugin ne garde aucune donnée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Processus → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
