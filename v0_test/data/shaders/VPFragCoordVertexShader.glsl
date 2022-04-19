#version 300 es
precision highp float;

layout (location = 0) in vec3 aVertexPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vFragCoord;

void main()
{
    vFragCoord = aVertexPosition;
    vec4 pos = uProjectionMatrix * mat4(mat3(uViewMatrix)) * vec4(aVertexPosition, 1.0);
    gl_Position = pos.xyww;
}  