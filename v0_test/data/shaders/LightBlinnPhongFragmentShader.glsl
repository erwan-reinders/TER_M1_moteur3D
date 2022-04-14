#version 300 es
precision highp float;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

uniform vec3 uViewPos;
out vec4 FragColor;

void main()
{
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;
    
    vec3 lighting  = Diffuse * 0.1; // hard-coded ambient component
    vec3 viewDir  = normalize(uViewPos - FragPos);

        // diffuse
        vec3 lightDir = normalize(vec3(1.0, 3.0, 2.0) - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * vec3(1.0, 1.0, 1.0);
        // specular
        vec3 halfwayDir = normalize(lightDir + viewDir);  
        float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
        vec3 specular = vec3(1.0, 1.0, 1.0) * spec * Specular;
        // attenuation
        float distance = length(vec3(1.0, 3.0, 2.0) - FragPos);
        float attenuation = 1.0 / (1.0 + 0.7 * distance + 0.18 * distance * distance);
        diffuse *= attenuation;
        specular *= attenuation;
        lighting += diffuse + specular;

    FragColor = vec4(lighting, 1.0);
    
}