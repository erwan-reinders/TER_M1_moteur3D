#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor1;
uniform sampler2D inputColor2;
uniform sampler2D inputColor3;

void main()
{
    FragColor = texture(inputColor1, TexCoords)+texture(inputColor2, TexCoords)+texture(inputColor3, TexCoords);
}