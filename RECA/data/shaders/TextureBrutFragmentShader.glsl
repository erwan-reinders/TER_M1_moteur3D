#version 300 es
precision highp float;
// Fragment-Interpolated data
in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;


// Texture
uniform sampler2D uSampler;

out vec4 FragColor;

void main(void) {
    vec4 texelColor = texture(uSampler, vFragUV);
    FragColor = texelColor;
}