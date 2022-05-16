#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D depthMap;

uniform mat4 uDepthViewMatrix;
uniform mat4 uDepthProjectionMatrix;

void main()
{
    vec3 FragPos = texture(gPosition, TexCoords).rgb;

    vec4 fragPosLightSpace = uDepthProjectionMatrix * uDepthViewMatrix * vec4(FragPos, 1.0);

    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;

    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(depthMap, projCoords.xy).r;

    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;

    // check whether current frag pos is in shadow
    float bias = 0.005;
    float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;  

    FragColor = vec4(vec3(1.0 - shadow), 1.0);
}