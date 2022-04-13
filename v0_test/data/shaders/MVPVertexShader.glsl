#version 300 es
precision highp float;

layout (location=0) in vec3 aVertexPosition;
layout (location=1) in vec3 aVertexNormal;
layout (location=2) in vec2 aVertexUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec3 vNormal;
out vec3 vFragPos;
out vec2 vFragUV;

void main(void) {
    vFragPos = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));
    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vFragUV = aVertexUV;

    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
}