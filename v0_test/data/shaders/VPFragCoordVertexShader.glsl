#version 300 es
precision highp float;

layout (location = 0) in vec3 aVertexPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vFragCoord;

void main()
{
    vFragCoord = aVertexPosition;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
}  