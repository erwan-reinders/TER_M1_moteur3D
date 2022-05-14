/** FOR CREATING UI IN THE INTERFACE **/
/**
 * Pour la création de l'interface.
 */
let rendering_options = document.getElementById("options");

let CSS_TAG = {
    vec: ["vec2", "vec3", "vec4"],
    description: "description",
    sliderdescription: "sliderdescription",
    number: "number",
    texture : "texture",
}

let vec_txt = ["x", "y", "z", "w"];
let color_txt = ["r", "g", "b", "a"];

let default_step = 0.1;
let default_val_min = 0;
let default_val_max = 1.0;


/**
 * Génère une balise spécifié par le type contenant un nom.
 * @param {string} name Le nom à afficher.
 * @param {CSS_TAG} tag_elem Le type d'element à afficher.
 * @returns {Element} L'element généré.
 */
function create_wrapper_UI(name, tag_elem) {
    //Create the main HTML elements
    let elem = document.createElement("div");
    let title = document.createElement("span");

    //Add classes for css treatment
    title.classList.add(CSS_TAG.description);
    elem.classList.add(tag_elem);

    //Then add the contain
    title.innerHTML = name;
    elem.appendChild(title);
    return elem;
}

/**
 * Génère et affiche un element permettant de modifier une valeur numérique.
 * @param {string} elem L'attribut à modifier.
 * @param {*} obj L'objet que l'on vas modifier.
 * @param {string} name Le nom affiché.
 * @param {number} step Le pas auquel la valeur vas être modifiée.
 */
function createValue_UI(elem, obj, name, step = default_step) {
    let wrapper = create_wrapper_UI(name, CSS_TAG.number);

    let input = document.createElement("input");
    input.type = "number";
    input.step = step;
    input.value = obj[elem];

    input.addEventListener("input", function (event) {
        obj[elem] = this.value;
        obj.test();
    });
    input.addEventListener("change", function (event) {
        obj[elem] = this.value;
        obj.test();
    });
    input.addEventListener("valuechange", function (event) {
        obj[elem] = this.value;
        obj.test();
    });
    wrapper.appendChild(input);
    rendering_options.appendChild(wrapper);
}

/**
 * Génère et affiche un element permettant de modifer un vecteur de 2, 3 ou 4 elements.
 * @param {string} elem L'attribut à modifier. On modifie obj.elem[0], obj.elem[1], ...
 * @param {*} obj L'objet que l'on vas modifier.
 * @param {string} name Le nom affiché.
 * @param {number} vecN Le nombre d'attribus du vecteur (2, 3 ou 4).
 * @param {number} step Le pas de modification de la valeur.
 * @param {boolean} color Le vecteur est-t-il une couleur?
 */
function createVecN_UI(elem, obj, name, vecN, step = default_step, color = false) {
    if (vecN < 2) vecN = 2;
    if (vecN > 4) vecN = 4;
    let wrapper = create_wrapper_UI(name, CSS_TAG.vec[vecN - 1]);

    for (var i = 0; i < vecN; i++) {
        let txt = ((color) ? color_txt[i] : vec_txt[i]);

        let label = document.createElement("span");
        label.innerHTML = "[" + txt + "]";
        wrapper.appendChild(label);

        let input = document.createElement("input");
        input.type = "number";
        input.step = step;
        input.value = elem;
        input._target = i;


        input.addEventListener("input", function (event) {
            obj[elem[event.target._target]] = this.value;
        });
        input.addEventListener("change", function (event) {
            obj[elem[event.target._target]] = this.value;
        });
        input.addEventListener("valuechange", function (event) {
            obj[elem[event.target._target]] = this.value;
        });
        wrapper.appendChild(input);
    }
    rendering_options.appendChild(wrapper);
}

/**
 * Génère et affiche un slider qui permet de modifier une valeur.
 * @param {string} elem L'attribut à modifier.
 * @param {*} obj L'objet que l'on vas modifier.
 * @param {string} name Le nom affiché.
 * @param {number} val_min La valeur minimum du slider.
 * @param {number} val_max La valeur maximum du slider.
 * @param {number} step Le pas du slider.
 */
function createValueSlider_UI(elem, obj, name, val_min = default_val_min, val_max = default_val_max, step = default_step){
    let wrapper = create_wrapper_UI(name,CSS_TAG.number);

    let span = document.createElement("span");
    span.classList.add(CSS_TAG.sliderdescription);
    span.innerHTML = obj[elem];

    let input = document.createElement("input");
    input.type = "range";
    input.step = step;
    input.value = obj[elem];
    input.min = val_min;
    input.max = val_max;
    input.defaultValue = obj[elem];

    input.addEventListener("input", function (event) {
        obj[elem] = this.value;
        span.innerHTML = this.value;
    });
    input.onmouseup = function () {
        this.blur();
    }

    let btn = document.createElement("button");
    btn.innerHTML = "reset";
    btn.onclick = function () {
        obj[elem] = input.defaultValue;
        input.value = input.defaultValue;
        span.innerHTML = input.defaultValue;
    }

    wrapper.appendChild(input);
    wrapper.appendChild(span);
    wrapper.appendChild(btn);
    rendering_options.appendChild(wrapper);
}

/**
 * Génère et affiche une boite pouvant accepter une image afin de modifier une texture.
 * PAS ENCORE IMPLEMENTE!!
 * @param {string} name Le nom affiché.
 */
function addTextureParameter(name) {
    let wrapper = create_wrapper_UI(name,CSS_TAG.texture);

    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpeg,.png,.ppm,.pgm";
    input.addEventListener("change", function (event) {
        console.log(event.target.value);
    });
    input.addEventListener("valuechange", function (event) {

    });
    wrapper.appendChild(input);
    rendering_options.appendChild(wrapper);
}