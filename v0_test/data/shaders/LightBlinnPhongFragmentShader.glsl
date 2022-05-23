#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

struct Light {
    vec3 Position;
    vec3 Color;
    
    float Linear;
    float Quadratic;
};
const int NR_LIGHTS = 16;
uniform Light uLights[NR_LIGHTS];

uniform int uNLights;
uniform vec3 uViewPos;
uniform float uAmbiant;

void main()
{
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;
    
    // ambient
    vec3 lighting = Diffuse * uAmbiant;
    
    vec3 viewDir  = normalize(uViewPos - FragPos);
    int loop = min(uNLights, NR_LIGHTS);
    for(int i = 0; i < loop; ++i)
    {
        // diffuse
        vec3 lightDir = normalize(uLights[i].Position - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * uLights[i].Color;
        // specular
        vec3 halfwayDir = normalize(lightDir + viewDir);  
        float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
        vec3 specular = uLights[i].Color * spec * Specular;
        // attenuation
        float distance = length(uLights[i].Position - FragPos);
        float attenuation = 1.0 / (1.0 + uLights[i].Linear * distance + uLights[i].Quadratic * distance * distance);
        diffuse *= attenuation;
        specular *= attenuation;
        lighting += diffuse + specular;
    }
    FragColor = vec4(lighting, 1.0);
    
}