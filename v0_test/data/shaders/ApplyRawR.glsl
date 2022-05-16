#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D inputColor;

out vec4 FragColor;

void main()
{
    FragColor = vec4(vec3(texture(inputColor, TexCoords).r), 1.0);
}