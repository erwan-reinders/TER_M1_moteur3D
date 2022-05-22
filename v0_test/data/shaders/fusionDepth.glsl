#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor0;
uniform sampler2D inputDepth0;

uniform sampler2D inputColor1;
uniform sampler2D inputDepth1;

uniform sampler2D inputColor2;
uniform sampler2D inputDepth2;

uniform sampler2D inputColor3;
uniform sampler2D inputDepth3;

uniform sampler2D inputDepth4;
uniform sampler2D inputColor4;

uniform sampler2D inputDepth5;
uniform sampler2D inputColor5;

uniform sampler2D inputDepth6;
uniform sampler2D inputColor6;

uniform sampler2D inputDepth7;
uniform sampler2D inputColor7;

uniform int uNbTextures;

void main()
{
    float minDepth = texture(inputDepth0, TexCoords).r;
    int minIndex = 0;
    float currentDepth;

    if (uNbTextures > 1) {
        currentDepth = texture(inputDepth1, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 1;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 2) {
        currentDepth = texture(inputDepth2, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 2;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 3) {
        currentDepth = texture(inputDepth3, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 3;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 4) {
        currentDepth = texture(inputDepth4, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 4;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 5) {
        currentDepth = texture(inputDepth5, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 5;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 6) {
        currentDepth = texture(inputDepth6, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 6;
            minDepth = currentDepth;
        }
    }
    if (uNbTextures > 7) {
        currentDepth = texture(inputDepth7, TexCoords).r;
        if (currentDepth < minDepth) {
            minIndex = 7;
            minDepth = currentDepth;
        }
    }

    vec4 color;
    switch (minIndex) {
    case 0:
        color = texture(inputColor0, TexCoords);
        break;
    case 1:
        color = texture(inputColor1, TexCoords);
        break;
    case 2:
        color = texture(inputColor2, TexCoords);
        break;
    case 3:
        color = texture(inputColor3, TexCoords);
        break;
    case 4:
        color = texture(inputColor4, TexCoords);
        break;
    case 5:
        color = texture(inputColor5, TexCoords);
        break;
    case 6:
        color = texture(inputColor6, TexCoords);
        break;
    case 7:
        color = texture(inputColor7, TexCoords);
        break;
    }

    FragColor = color;
}