#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor0;
uniform sampler2D inputColor1;
uniform sampler2D inputColor2;
uniform sampler2D inputColor3;
uniform sampler2D inputColor4;
uniform sampler2D inputColor5;
uniform sampler2D inputColor6;
uniform sampler2D inputColor7;
uniform sampler2D inputColor8;
uniform sampler2D inputColor9;
uniform sampler2D inputColor10;
uniform sampler2D inputColor11;
uniform sampler2D inputColor12;
uniform sampler2D inputColor13;
uniform sampler2D inputColor14;
uniform sampler2D inputColor15;

uniform int uNbTextures;

void main()
{
    vec3 color = vec3(0.0);
    
    if (uNbTextures > 0) {
        color += texture(inputColor0, TexCoords).rgb;
    }
    if (uNbTextures > 1) {
        color += texture(inputColor1, TexCoords).rgb;
    }
    if (uNbTextures > 2) {
        color += texture(inputColor2, TexCoords).rgb;
    }
    if (uNbTextures > 3) {
        color += texture(inputColor3, TexCoords).rgb;
    }
    if (uNbTextures > 4) {
        color += texture(inputColor4, TexCoords).rgb;
    }
    if (uNbTextures > 5) {
        color += texture(inputColor5, TexCoords).rgb;
    }
    if (uNbTextures > 6) {
        color += texture(inputColor6, TexCoords).rgb;
    }
    if (uNbTextures > 7) {
        color += texture(inputColor7, TexCoords).rgb;
    }
    if (uNbTextures > 8) {
        color += texture(inputColor8, TexCoords).rgb;
    }
    if (uNbTextures > 9) {
        color += texture(inputColor9, TexCoords).rgb;
    }
    if (uNbTextures > 10) {
        color += texture(inputColor10, TexCoords).rgb;
    }
    if (uNbTextures > 11) {
        color += texture(inputColor11, TexCoords).rgb;
    }
    if (uNbTextures > 12) {
        color += texture(inputColor12, TexCoords).rgb;
    }
    if (uNbTextures > 13) {
        color += texture(inputColor13, TexCoords).rgb;
    }
    if (uNbTextures > 14) {
        color += texture(inputColor14, TexCoords).rgb;
    }
    if (uNbTextures > 15) {
        color += texture(inputColor15, TexCoords).rgb;
    }

    FragColor = vec4(color, 1.0);
}