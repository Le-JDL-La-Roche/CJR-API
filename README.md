# A propos de l'API

L'API (Application Programming Interface) Web de la CJR est un service accessible parle biais du protocole HTTP ou HTTPS permettant de relier le site Web à sa Base de Données et d'effectuer les calculs intermédiaires.
L'API de la CJR est utilisée par chaque utilisateur et par les administrateurs du site, permettant l'accès et la modification des données du site Web (écoles, équipes, matchs, ...).

L'API est accessible à l'adresse [api.cjr.le-jdl-laroche.cf](https://api.cjr.le-jdl-laroche.cf).
L'API n'utilise les cookies que pour l'authentification des  administrateurs.

## Hébergement du Blog

Cette API est hébergé chez [Hostim](https://hostim.fr).
Le nom de domaine [api.cjr.le-jdl-laroche.cf](https://api.cjrle-jdl-laroche.cf) est enregistré chez [Freenom](https://freenom.com).

## Développement de l'API

L'API de la CJR utilise la technologie [Express.js](https://expressjs.com), ainsi que différentes librairies Node.js qui lui sont associées. L'utilisation de cette technologie ne concerne que le back-end du site Web (partie non-visible par les utilisateurs, concernant les calculs).

L'API est hébergé sur un server Node.js, qui sert les fichiers, en combinaison avec un server NGINX pour l'acheminement des requêtes.

## *Open source*

Le code source de l'API est disponible sur [GitHub](/https://github.com/Le-JDL-La-Roche/CJR-API) sous licence [GNU GPLv3](https://github.com/Le-JDL-La-Roche/CJR-API/blob/main/LICENSE). Vous pouvez donc le consulter, le modifier et le redistribuer librement, à condition de respecter les termes de la licence.

En cas de problème/bug/suggestion, vous pouvez [ouvrir une *issue*](https://github.com/Le-JDL-La-Roche/CJR-API/issues) sur GitHub.