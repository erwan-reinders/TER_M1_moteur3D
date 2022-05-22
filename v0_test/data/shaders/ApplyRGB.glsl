#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D inputColor;

out vec4 FragColor;

void main()
{
    vec3 color = texture(inputColor, TexCoords).rgb;
    color = max(color, 0.0);
    color = color / (color + vec3(1.0, 1.0, 1.0));
    FragColor = vec4(color, 1.0);
}