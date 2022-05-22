#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;
uniform sampler2D shadowMap;
uniform sampler2D SSAOMap;
uniform sampler2D previousBlinnPhong;

struct Light {
    vec3 Position;
    vec3 Color;
    
    float Linear;
    float Quadratic;
};
uniform Light uLight;

uniform vec3 uViewPos;
uniform bool useAmbiantAndSSAO;
uniform float uAmbiant;

uniform bool usePrevious;

void main()
{
    vec3 FragPos   = texture(gPosition,   TexCoords).rgb;
    vec3 Normal    = texture(gNormal,     TexCoords).rgb;
    vec3 Diffuse   = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;
    float Shadow   = texture(shadowMap,   TexCoords).r;

    vec3 lighting = usePrevious ? texture(previousBlinnPhong, TexCoords).rgb : vec3(0.0);
    if (useAmbiantAndSSAO) {
        float SSAO = texture(SSAOMap, TexCoords).r;
        lighting += Diffuse * uAmbiant * SSAO;
    }

    vec3 viewDir  = normalize(uViewPos - FragPos);

    // diffuse
    vec3 lightDir = normalize(uLight.Position - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * uLight.Color;
    // specular
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
    vec3 specular = uLight.Color * spec * Specular;
    // attenuation
    float distance = length(uLight.Position - FragPos);
    float attenuation = 1.0 / (1.0 + uLight.Linear * distance + uLight.Quadratic * distance * distance);
    diffuse *= attenuation;
    specular *= attenuation;
    lighting += (diffuse + specular) * Shadow;

    FragColor = vec4(lighting, 1.0);
    //FragColor = vec4(vec3(Shadow), 1.0);
}