#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

uniform vec3 uViewPos;
uniform samplerCube skybox;

uniform float uRatio;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

void main()
{
    vec3 I = normalize(vFragPos - uViewPos);
    vec3 R = refract(I, vNormal, uRatio);
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}