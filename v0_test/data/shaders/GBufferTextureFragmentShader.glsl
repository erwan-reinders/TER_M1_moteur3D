#version 300 es
precision highp float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

uniform sampler2D uDiffuseTexture;
uniform vec3 uDiffuseFactor;
uniform sampler2D uSpecularTexture;
uniform float uSpecularFactor;

void main()
{    
    gPosition = vec4(vFragPos, 1.0);
    gNormal = vec4(normalize(vNormal), 1.0);
    gAlbedoSpec.rgb = texture(uDiffuseTexture, vFragUV).rgb * pow(uDiffuseFactor, vec3(2.2));
    gAlbedoSpec.a = texture(uSpecularTexture, vFragUV).r * uSpecularFactor;
}