#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec3 vFragCoord;

uniform samplerCube skybox;

void main()
{
    FragColor = texture(skybox, vFragCoord);
}