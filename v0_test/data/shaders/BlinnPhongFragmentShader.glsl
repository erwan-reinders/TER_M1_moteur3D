#version 300 es
precision highp float;
// Fragment-Interpolated data
in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

// Camera
uniform vec3 uViewPos;
// Light
uniform vec3 uLightPos;
uniform vec3 uLightColor;

// Material
uniform vec3 uObjectColor;
uniform float uShininess;
// uniform sampler2D uSampler;// texture

out vec4 FragColor;

void main(void) {
    // highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    // ambient
    float ambientStrength = 0.1;
    vec3 ambient = ambientStrength * uObjectColor;

    // diffuse
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(uLightPos - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * uLightColor * uObjectColor;

    // specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(uViewPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
    vec3 specular = specularStrength * spec * uLightColor;

    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}