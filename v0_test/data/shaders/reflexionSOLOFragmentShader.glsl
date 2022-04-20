#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

uniform vec3 uViewPos;
uniform samplerCube skybox;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

void main()
{
    vec3 I = normalize(vFragPos - uViewPos);
    vec3 R = reflect(I, vNormal);
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}