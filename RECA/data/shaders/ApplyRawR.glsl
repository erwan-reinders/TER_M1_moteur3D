#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D inputColor;

out vec4 FragColor;

void main()
{
    float color = texture(inputColor, TexCoords).r;
    FragColor = vec4(vec3(color), 1.0);
}