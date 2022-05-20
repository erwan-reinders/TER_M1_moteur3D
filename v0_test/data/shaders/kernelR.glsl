#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor;

const int NR_KERNEL = 9;
uniform float uKernel[NR_KERNEL];

void main()
{
    //On sépare l'alpha car on ne lui applique pas la convolution
    
    float color = 0.0;
    float alpha = texture(inputColor, TexCoords).a;

    vec2 texelSize = vec2(1.0) / vec2(textureSize(inputColor, 0));

    for(int i = 0; i < 3; ++i) {
        for(int j = 0; j < 3; ++j) {
            color += texture(inputColor, TexCoords + vec2(j-1, i-1) * texelSize).r * uKernel[i*3+j];
        }
    }

    FragColor = vec4(vec3(color), alpha);
}