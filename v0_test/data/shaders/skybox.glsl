#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec3 vFragPos;

uniform samplerCube skybox; 

void main()
{
    vec3 color = texture(skybox, vFragPos).rgb;
    FragColor = vec4(color, 1.0);
} 