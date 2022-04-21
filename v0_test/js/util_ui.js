/** FOR CREATING UI IN THE INTERFACE **/
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

function createValue_UI(elem,obj,name, step = default_step) {
    let wrapper = create_wrapper_UI(name,CSS_TAG.number);

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

function createVecN_UI(elem,name, N, step = default_step, color = false) {
    if (N < 2) N = 2;
    if (N > 4) N = 4;
    let wrapper = create_wrapper_UI(name,CSS_TAG.vec[N - 1]);

    for (var i = 0; i < N; i++) {
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
            elem[event.target._target] = this.value;
        });
        input.addEventListener("change", function (event) {
            elem[event.target._target] = this.value;
        });
        input.addEventListener("valuechange", function (event) {
            elem[event.target._target] = this.value;
        });
        wrapper.appendChild(input);
    }
    rendering_options.appendChild(wrapper);
}

function createValueSlider_UI(elem, obj, name,val_min = default_val_min,val_max = default_val_max,step = default_step){
    let wrapper = create_wrapper_UI(name,CSS_TAG.number);

    let span = document.createElement("span");
    span.classList.add(CSS_TAG.sliderdescription);

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