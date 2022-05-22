#version 300 es
precision highp float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gNormalMap;
layout (location = 4) out vec4 gMettalicRoughnesAO;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;

uniform vec3 uAlbedoCoef;
uniform float uMetallicCoef;
uniform float uRoughnessCoef;
uniform float uAOCoef;

void main()
{
    gPosition           = vec4(vFragPos, 1.0);
    gNormal             = vec4(normalize(vNormal), 1.0);
    gAlbedo.rgb         = texture(albedoMap, vFragUV).rgb * pow(uAlbedoCoef, vec3(2.2));
    gNormalMap          = vec4(texture(normalMap, vFragUV).rgb,1);
    gMettalicRoughnesAO = vec4(texture(metallicMap,vFragUV).r * uMetallicCoef,texture(roughnessMap,vFragUV).r * uRoughnessCoef,texture(aoMap,vFragUV).r * uAOCoef,1);
}