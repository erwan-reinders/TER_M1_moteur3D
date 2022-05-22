#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor;

uniform float seuil;
uniform vec4 defaultColor;

void main()
{
    //On sépare l'alpha car on ne lui applique pas le traitement
    
    vec3 color = texture(inputColor, TexCoords).rgb;
    float alpha = texture(inputColor, TexCoords).a;

    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

    FragColor = brightness > seuil ? vec4(color, alpha) : vec4(defaultColor);
}