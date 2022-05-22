#version 300 es
precision highp float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

void main()
{    
    gPosition = vec4(vFragPos, 1.0);
    gNormal = vec4(normalize(vNormal), 1.0);
}