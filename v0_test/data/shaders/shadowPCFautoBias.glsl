#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D depthMap;
uniform sampler2D gNormal;

uniform mat4 uDepthViewMatrix;
uniform mat4 uDepthProjectionMatrix;

uniform vec3 uLightDir;
uniform float uBias;

void main()
{
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal  = texture(gNormal, TexCoords).rgb;

    vec4 fragPosLightSpace = uDepthProjectionMatrix * uDepthViewMatrix * vec4(FragPos, 1.0);

    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;

    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    // float closestDepth = texture(depthMap, projCoords.xy).r;

    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;

    // check whether current frag pos is in shadow
    // float shadow = currentDepth - uBias > closestDepth  ? 1.0 : 0.0;
    // shadow = projCoords.z >= 1.0 ? 0.0 : shadow;
    float bias = max(uBias * (1.0 - dot(Normal, uLightDir)), uBias * 0.1);

    float shadow = 0.0;
    vec2 texelSize = vec2(1.0) / vec2(textureSize(depthMap, 0));
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(depthMap, projCoords.xy + vec2(x, y) * texelSize).r; 
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }    
    }
    shadow /= 9.0;
    shadow = projCoords.z >= 1.0 ? 0.0 : shadow;

    FragColor = vec4(vec3(1.0 - shadow), 1.0);
}