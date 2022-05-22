#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

uniform vec3 uLightPos;
uniform float uFarPlane;

out vec4 FragColor;


void main()
{
    float lightDistance = length(vFragPos.xyz - uLightPos);
    
    // map to [0;1] range by dividing by far_plane
    lightDistance = lightDistance / uFarPlane;
    
    // write this as modified depth
    FragColor = vec4(lightDistance, 0.0, 0.0, 1.0);
    //FragColor = vec4(vFragPos, 1.0);
}