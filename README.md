# Réalisation d'un moteur 3D temps réel réaliste.
Dépôt de projet du TER de deuxième semestre de M1 informatique.
______________________________
## Problématique
La **3D** est au cœur de nombreuses applications de nos jours, et tend à se démocratiser de plus en plus dans des secteurs comme la publicité, le divertissement ou encore l'architecture.
Dans ce flot de nouveaux domaines possibles d'application, deux courants majeurs de rendu 3D émergent : le **temps réel** (exploitant le pipeline graphique GPU) et les **rendus en temps plus ou moins maitrisés** (comme le raytracing par exemple), pouvant mettre jusqu'à plusieurs jours pour le rendu d'une simple image numérique à partir d'une scène en 3D. 
Pour certains domaines, il va de soi que le calcul d'une image se faisant sur plusieurs jours n'est pas envisageable, comme pour le jeu vidéo par exemple (30fps). C'est donc vers le rendu temps réel que ce genre d'applications vont se tourner, et c'est ce que nous allons aborder dans notre TER.
Plus précisément, nous allons aborder les **différentes techniques permettant d'obtenir un bon compromis entre temps de calcul d'une seule image et qualité de rendu numérique**, le tout à partir d'une scène 3D sur ordinateur. Cela passera par la prise en main des différentes possibilités de rendu en 3D temps réel existantes (Blinn-Phong, BRDF ...), de ce qu'elles permettent ou pas de faire, puis implémenter certaines de leurs caractéristiques, les comparer (sur leur aspect qualitatif, effet visé ...), dans le but d'en entrevoir leurs limites, mais également l'ensemble des possibles qu'elles allouent (type de matériaux et effets implémentables, réaction à la lumière, type d'éléments nécessaires à l'élaboration de ce type de rendu ...). 

## Missions
Un objet dans une scène en 3D est rendu visible à l'image par la **lumière** qui se reflète sur lui. Selon le type de calculs que l'on va opérer à partir de **propriétés matérielles** de cet objet, nous allons pouvoir obtenir des effets différents vis-à-vis de la lumière qui l'éclaire, et ainsi réaliser différents types de matériaux existants (métaux, tissus, peau, surface matte, surface rugueuse ...). L'intérêt principal de ce projet réside donc dans un premier temps à **diversifier** au mieux ces techniques de rendu et de les **implémenter** au cœur d'un unique moteur de rendu 3D temps réel.
Par la suite, il n'est pas exclu (dépendant de l'avancement du projet), de mettre en place, à partir de techniques de rendu préalablement implémentées, la **création de nouveaux types de matériaux** pour accroître les possibilités de rendu et ainsi étendre les possibilités artistiques d'un tel moteur de rendu.
On pourrait aussi envisager la possibilité pour un **utilisateur extérieur** au projet, mais familier aux rendus 3D par ordinateur, de **manipuler notre moteur de rendu** afin de pouvoir, à partir d'une interface, créer et visualiser ses propres matériaux (en renseignant ses caractéristiques parmi une liste prédéterminée issue de la phase un et deux du projet).

## Détails techniques
Ce projet est fait via **WebGl** en **JS**.
