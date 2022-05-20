#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor;

uniform float exposure;

//https://learnopengl.com/Advanced-Lighting/HDR
void main()
{
    //On sépare l'alpha car on ne lui applique pas la correction
    
    vec3 color = texture(inputColor, TexCoords).rgb;
    float alpha = texture(inputColor, TexCoords).a;

    FragColor = vec4(vec3(1.0) - exp(-color * exposure), alpha);
}