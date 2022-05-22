#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 LoColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;

// material parameters
uniform sampler2D gAlbedoMap;
uniform sampler2D gNormalMap;
uniform sampler2D gMettalicRoughnesAO;


// lights
struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
};

const int NR_LIGHTS = 16;
uniform Light uLights[NR_LIGHTS];
uniform int uNLights;

uniform vec3 uViewPos;

const float PI = 3.14159265359;

// ----------------------------------------------------------------------------
// Easy trick to get tangent-normals to world-space to keep PBR code simplified.
vec3 getNormalFromMap(vec3 Normal, vec3 WorldPos){
    vec3 tangentNormal = texture(gNormalMap, TexCoords).xyz * 2.0 - 1.0;

    vec3 Q1  = dFdx(WorldPos);
    vec3 Q2  = dFdy(WorldPos);
    vec2 st1 = dFdx(TexCoords);
    vec2 st2 = dFdy(TexCoords);

    vec3 N   = normalize(Normal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);
    return normalize(TBN * tangentNormal);
}
// ----------------------------------------------------------------------------
float DistributionGGX(vec3 N, vec3 H, float roughness){
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySchlickGGX(float NdotV, float roughness){
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness){
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlick(float cosTheta, vec3 F0){
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
// ----------------------------------------------------------------------------
void main(){
    vec3 WorldPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;

    // vec3 albedo     = pow(texture(gAlbedoMap, TexCoords).rgb, vec3(2.2));
    vec3 albedo     = texture(gAlbedoMap, TexCoords).rgb;
    float metallic  = texture(gMettalicRoughnesAO, TexCoords).r;
    float roughness = texture(gMettalicRoughnesAO, TexCoords).g;
    float ao        = texture(gMettalicRoughnesAO, TexCoords).b;

    vec3 N = getNormalFromMap(Normal,WorldPos);
    vec3 V = normalize(uViewPos - WorldPos);

    // calculate reflectance at normal incidence; if dia-electric (like plastic) use F0
    // of 0.04 and if it's a metal, use the albedo color as F0 (metallic workflow)
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);
    int loop = min(uNLights, NR_LIGHTS);
    vec3 radiance;
    vec4 test;
    for(int i = 0; i < loop; ++i){
        // calculate per-light radiance
        vec3 L = normalize(uLights[i].Position - WorldPos);
        vec3 H = normalize(V + L);

        float distance = length(uLights[i].Position - WorldPos);
        float attenuation = 1.0 / (1.0 + uLights[i].Linear * distance + uLights[i].Quadratic * distance * distance);
        // float attenuation = 1.0 / (distance * distance * 0.007);
        radiance = uLights[i].Color * attenuation;

        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G   = GeometrySmith(N, V, L, roughness);
        vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);

        vec3 numerator    = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001; // + 0.0001 to prevent divide by zero
        vec3 specular = numerator / denominator;

        // kS is equal to Fresnel
        vec3 kS = F;
        // for energy conservation, the diffuse and specular light can't
        // be above 1.0 (unless the surface emits light); to preserve this
        // relationship the diffuse component (kD) should equal 1.0 - kS.
        vec3 kD = vec3(1.0) - kS;
        // multiply kD by the inverse metalness such that only non-metals
        // have diffuse lighting, or a linear blend if partly metal (pure metals
        // have no diffuse light).
        kD *= 1.0 - metallic;

        // scale light by NdotL
        float NdotL = max(dot(N, L), 0.0);

        // add to outgoing radiance Lo
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
        test.rgb = radiance;
        test.a = attenuation;
    }

    vec3 ambient = vec3(0.03) * albedo * ao;
    vec3 color = ambient + Lo;

    LoColor = vec4(Lo, 1.0);
    // HDR tonemapping
    //color = color / (color + vec3(1.0));
    // gamma correct
    //color = pow(color, vec3(1.0/2.2));
    FragColor = vec4(color* vec3(10.0), 1.0);
    LoColor = vec4(Lo * vec3(10.0), 1.0);
    // FragColor = vec4(test.rgb, 1.0);
    // LoColor = vec4(vec3(test.a), 1.0);
    // FragColor = vec4(F0, 1.0);
}