#version 300 es
precision highp float;

layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

uniform vec3 uObjectColor;
uniform float uObjectSpecular;

void main()
{    
    gPosition = vFragPos;
    gNormal = normalize(vNormal);
    gAlbedoSpec.rgb = uObjectColor;
    gAlbedoSpec.a = uObjectSpecular;
}