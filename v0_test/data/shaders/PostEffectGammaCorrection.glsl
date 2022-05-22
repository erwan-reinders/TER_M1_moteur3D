#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor;

uniform float gamma;

void main()
{
    //On sépare l'alpha car on ne lui applique pas le traitement
    
    vec3 color = texture(inputColor, TexCoords).rgb;
    float alpha = texture(inputColor, TexCoords).a;

    FragColor = vec4(pow(color, vec3(1.0/gamma)), alpha);
}