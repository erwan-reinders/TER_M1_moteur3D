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
const int NR_LIGHTS = 2;
uniform Light uLights[NR_LIGHTS];
uniform samplerCube DepthMap;

uniform vec3 uViewPos;

uniform float uFarPlane;

float ShadowCalculation(vec3 lightPos, vec3 fragPos)
{
    vec3 fragToLight = fragPos - lightPos;
    float closestDepth = texture(DepthMap, fragToLight).r;
    closestDepth *= uFarPlane;
    float currentDepth = length(fragToLight);
    float bias = 0.05;
    float shadow = currentDepth - bias > closestDepth ? 0.0 : 1.0;
        
    return shadow;
}

void main()
{
    vec3  FragPos  = texture(gPosition,   TexCoords).rgb;
    vec3  Normal   = texture(gNormal,     TexCoords).rgb;
    vec3  Diffuse  = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;
    
    vec3 lighting = Diffuse * 0.1; // hard-coded ambient component
    vec3 viewDir  = normalize(uViewPos - FragPos);

    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // diffuse
        vec3 lightDir = normalize(uLights[i].Position - FragPos);
        vec3 diffuse  = max(dot(Normal, lightDir), 0.0) * Diffuse * uLights[i].Color;
        // specular
        vec3 halfwayDir = normalize(lightDir + viewDir);  
        float spec      = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
        vec3 specular   = uLights[i].Color * spec * Specular;
        // attenuation
        float distance    = length(uLights[i].Position - FragPos);
        float attenuation = 1.0 / (1.0 + uLights[i].Linear * distance + uLights[i].Quadratic * distance * distance);
        diffuse  *= attenuation;
        specular *= attenuation;
        // calculate shadow
        float shadow = ShadowCalculation(uLights[i].Position, FragPos);
        lighting += shadow * (diffuse + specular);
    }

    FragColor = vec4(lighting, 1.0);
    FragColor += vec4(texture(DepthMap, vec3(TexCoords, 0.8)).r, 0.0, 0.0, 1.0);
}