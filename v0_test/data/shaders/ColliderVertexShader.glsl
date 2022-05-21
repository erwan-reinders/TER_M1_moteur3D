#version 330 core

layout(location = 0) in vec3 vertex;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uSize;

void main(){
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(vertex * uSize, 1.0);
}