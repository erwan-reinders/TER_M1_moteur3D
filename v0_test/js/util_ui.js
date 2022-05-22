/** FOR CREATING UI IN THE INTERFACE **/
/**
 * Pour la création de l'interface.
 **/

let rendering_options;

let allObjectsSlider    = [];
let allSliders          = [];


let currentContainer;
let options_title;
let stats = new Array();

let CSS_TAG = {
    vec: ["vec2", "vec3", "vec4"],
    description: "description",
    sliderdescription: "sliderdescription",
    number: "number",
    texture : "texture",
}

let vec_txt = ["x", "y", "z", "w"];
let color_txt = ["r", "g", "b", "a"];

let default_step        = 0.1;
let default_val_min     = 0;
let default_val_max     = 1.0;

function initUi() {
    rendering_options   = document.getElementById("options_list");
    options_title       = document.getElementById("options_title");

    currentContainer = rendering_options;
    dom_options.style.display = "none";

    dom_options_icon.onclick = function() {
        dom_options_icon.style.display = "none";
        dom_options.style.setProperty("animation", "width_appear .5s forwards");
        dom_options.style.display = "block";
    };

    dom_options_icon_close.onclick = function (){

        setTimeout(function () {
            dom_options_icon.style.display = "block";
        }, time_interval_maj);

        dom_options.style.setProperty("animation", "width_disappear .5s forwards");
        //dom_options.style.display = "none";
    }
}

/**
 * Modifie l'élement pour le cacher si il est visible ou le rendre visible si il est caché.
 * @param {Element} el L'élement à modifier.
 */

function toggleDisplayOnElement(el) {
    if (el.style.display != "block") {
        el.style.display = "block";
        //el.style.setProperty("animation", "height_appear .5s forwards");
    }
    else {
        el.style.display = "none";
        //el.style.setProperty("animation", "height_disappear .5s forwards");
    }
}

function toggleDisplayOnElementAnimation(el) {
    if (el.style.maxHeight) {
        el.style.maxHeight = null;
    } else {
        let v = getScrollH(el);
        //console.log(el);
        //console.log("SCROLL VAL OF EL : " + v);
        el.style.maxHeight = v + "px";
    }
}


function getScrollH(opOptContainer){
    let res = opOptContainer.scrollHeight;
    let subel = opOptContainer.getElementsByClassName("options_container");

    for (let e of subel){
        res+= getScrollH(e);
    }
    return res;
}



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

    // input.addEventListener("input", function (event) {
    //     obj[elem] = this.value;
    //     obj.test();
    // });
    input.addEventListener("change", function (event) {
        obj[elem] = this.value;
        if (obj.onUiChange != undefined) {
            obj.onUiChange(this);
        }
    });
    // input.addEventListener("valuechange", function (event) {
    //     obj[elem] = this.value;
    //     obj.test();
    // });
    wrapper.appendChild(input);
    currentContainer.appendChild(wrapper);
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
    let wrapper = create_wrapper_UI(name, CSS_TAG.vec[vecN - 2]);

    for (var i = 0; i < vecN; i++) {
        let txt = ((color) ? color_txt[i] : vec_txt[i]);

        let label = document.createElement("span");
        label.innerHTML = "[" + txt + "]";
        wrapper.appendChild(label);

        let input = document.createElement("input");
        input.type = "number";
        input.step = step;
        input.value = parseInt(obj[elem][i] * 10.0) * 0.1;
        input._target = i;


        input.addEventListener("input", function (event) {
            obj[elem][event.target._target] = this.value;
            if (obj.onUiChange != undefined) {
                obj.onUiChange(this);
            }
        });
        input.addEventListener("change", function (event) {
            obj[elem[event.target._target]] = this.value;
            if (obj.onUiChange != undefined) {
                obj.onUiChange(this);
            }
        });
        input.addEventListener("valuechange", function (event) {
            obj[elem[event.target._target]] = this.value;
            if (obj.onUiChange != undefined) {
                obj.onUiChange(this);
            }
        });
        wrapper.appendChild(input);
    }
    currentContainer.appendChild(wrapper);
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
    let wrapper = create_wrapper_UI(name, CSS_TAG.number);

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
        if (obj.onUiChange != undefined) {
            obj.onUiChange(this);
        }
    });
    input.onmouseup = function () {
        this.blur();
    }

    let btn = document.createElement("button");
    btn.innerHTML = "reset";

    allObjectsSlider.push([obj, elem]);
    allSliders.push([input, span]);

    btn.onclick = function () {
        obj[elem]       = input.defaultValue;
        input.value     = input.defaultValue;
        span.innerHTML  = input.defaultValue;
        if (obj.onUiChange != undefined) {
            obj.onUiChange(this);
        }
    }

    wrapper.appendChild(input);
    wrapper.appendChild(span);
    wrapper.appendChild(btn);
    currentContainer.appendChild(wrapper);
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
    currentContainer.appendChild(wrapper);
}

/**
 * Créée une nouvelle catégorie à la racine des catégories.
 * @param {string} name Nom à afficher
 */
function createSeparateur(name) {
    resetSeparateur();
    createSeparateurInside(name);
}

/**
 * Créée une nouvelle catégorie dans la catégorie courrante.
 * @param {string} name Nom à afficher
 * @param {string} elementType Le type de séparateur (h2, h3, ...)
 */
function createSeparateurInside(name, elementType = "h2") {


    let elem = document.createElement(elementType);
    let repeatNumber = 3;
    //elem.innerHTML = "-".repeat(repeatNumber) + name + "-".repeat(repeatNumber);
    elem.innerHTML = name;
    elem.classList.add("option_separator");
    //elem.classList.add("row");

    let newContainer = document.createElement("div");
    newContainer.classList.add("options_container");

    elem.onclick = function() {
        //toggleDisplayOnElement(newContainer);
        //console.log("ONCLICK !");
        //console.log(elem);
        //console.log(newContainer);

        toggleDisplayOnElementAnimation(newContainer);
    };
    currentContainer.appendChild(elem);
    currentContainer.appendChild(newContainer);

    currentContainer = newContainer;
}

/**
 * Ferme le séparateur courrant. On se retrouve dans la balise du parent.
 */
function endSeparateur() {
    if (currentContainer != rendering_options) {
        currentContainer = currentContainer.parentElement;
    }
}

/**
 * Remet le séparateur dans la balise racine.
 */
function resetSeparateur() {
    currentContainer = rendering_options;
}


function fetchStat(id) {
    stats[id] = document.getElementById(id);
}

dom_resetAllButton.onclick = function (){
    for (let i = 0; i < allSliders.length; i++) {
        let slider  = allSliders[i][0];
        let span    = allSliders[i][1];
        slider.value    = slider.defaultValue;
        span.innerHTML  = slider.defaultValue;

        let sliderObj = allObjectsSlider[i];
        sliderObj[0][sliderObj[1]] = slider.defaultValue;
        if (sliderObj[0].onUiChange != undefined) {
            sliderObj[0].onUiChange(this);
        }
    }
}