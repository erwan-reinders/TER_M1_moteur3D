#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D inputColor;

out vec4 FragColor;

bool closeToZeroWithBias(vec3 value) {
    float bias = 0.0001;
    return value.x < bias && value.x > -bias && value.y < bias && value.y > -bias && value.z < bias && value.z > -bias;
}

void main()
{
    vec3 color = texture(inputColor, TexCoords).rgb;
    if (closeToZeroWithBias(color)) {
        discard;
    }
    color = max(color, 0.0);
    color = color / (color + vec3(1.0, 1.0, 1.0));
    FragColor = vec4(color, 1.0);
}