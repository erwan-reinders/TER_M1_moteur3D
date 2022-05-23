#version 300 es
precision highp float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gNormalFromMap;
layout (location = 4) out vec4 gMettalicRoughnesAO;

in vec3 vNormal;
in vec3 vFragPos;
in vec2 vFragUV;

uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;

uniform vec3  uAlbedoCoef;
uniform float uMetallicCoef;
uniform float uRoughnessCoef;
uniform float uAOCoef;

// ----------------------------------------------------------------------------
// Easy trick to get tangent-normals to world-space to keep PBR code simplified.
vec3 getNormalFromMap(vec3 Normal, vec3 WorldPos){
    vec3 tangentNormal = texture(normalMap, vFragUV).xyz * 2.0 - 1.0;

    vec3 Q1  = dFdx(WorldPos);
    vec3 Q2  = dFdy(WorldPos);
    vec2 st1 = dFdx(vFragUV);
    vec2 st2 = dFdy(vFragUV);

    vec3 N  = Normal;
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -cross(N, T);
    mat3 TBN = mat3(T, B, N);
    return normalize(TBN * tangentNormal);
}

void main()
{
    gPosition           = vec4(vFragPos, 1.0);
    gNormal             = vec4(normalize(vNormal), 1.0);
    gAlbedo.rgb         = texture(albedoMap, vFragUV).rgb * pow(uAlbedoCoef, vec3(2.2));
    // gNormalFromMap      = vec4(getNormalFromMap(gNormal.xyz, gPosition.xyz), 1.0);
    gNormalFromMap      = vec4(gNormal.xyz, 1.0);
    gMettalicRoughnesAO = vec4(texture(metallicMap,vFragUV).r * uMetallicCoef,texture(roughnessMap,vFragUV).r * uRoughnessCoef,texture(aoMap,vFragUV).r * uAOCoef,1);
}