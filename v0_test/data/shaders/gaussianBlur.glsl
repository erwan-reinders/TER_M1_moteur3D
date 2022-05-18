#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D inputColor;

uniform bool horizontal;
uniform float weight[5];

void main()
{
    //On sépare l'alpha car on ne lui applique pas le traitement
    
    vec3 color = texture(inputColor, TexCoords).rgb;
    float alpha = texture(inputColor, TexCoords).a;

    vec2 tex_offset = 1.0 / vec2(textureSize(inputColor, 0)); // gets size of single texel
    vec3 result = texture(inputColor, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal) {
        for(int i = 1; i < 5; ++i) {
            result += texture(inputColor, TexCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
            result += texture(inputColor, TexCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
        }
    }
    else {
        for(int i = 1; i < 5; ++i) {
            result += texture(inputColor, TexCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
            result += texture(inputColor, TexCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
        }
    }

    FragColor = vec4(result, 1.0);
}