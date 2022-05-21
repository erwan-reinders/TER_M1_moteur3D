#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D inputColor;

out vec4 FragColor;

bool closeToZeroWithBias(float value) {
    float bias = 0.0001;
    return value < bias && value > -bias;
}

void main()
{
    float color = texture(inputColor, TexCoords).r;
    if (closeToZeroWithBias(color)) {
        discard;
    }
    FragColor = vec4(vec3(color), 1.0);
}