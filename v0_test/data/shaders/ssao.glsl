#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D texNoise;

uniform vec3 samples[128];

uniform int kernelSize;
uniform float radius;
uniform float depthBias;
uniform float angleBias;
uniform float uNoiseScale;
uniform float occlusionPower;

uniform mat4 uUsedViewMatrix;
uniform mat4 uUsedProjectionMatrix;

float lerp(float a, float b, float x) {
    return a + x * (b - a);
}

bool closeToZeroWithBias(vec3 value) {
    float bias = 0.0001;
    return value.x < bias && value.x > -bias && value.y < bias && value.y > -bias && value.z < bias && value.z > -bias;
}

void main()
{
    // get input for SSAO algorithm
    vec3 WorldFragPos = texture(gPosition,   TexCoords).rgb;
    WorldFragPos = closeToZeroWithBias(WorldFragPos)? vec3(0.0) : WorldFragPos;
    vec3 FragPos   = (uUsedViewMatrix * vec4(WorldFragPos, 1.0)).rgb;
    vec3 Normal    = texture(gNormal, TexCoords).rgb;

    vec2 noiseScale = vec2(textureSize(gPosition, 0)) * uNoiseScale;
    vec3 randomVec = normalize(texture(texNoise, TexCoords * noiseScale).xyz);

    // create TBN change-of-basis matrix: from tangent-space to view-space
    vec3 tangent = normalize(randomVec - Normal * dot(randomVec, Normal));
    vec3 bitangent = cross(Normal, tangent);
    mat3 TBN = mat3(tangent, bitangent, Normal);

    // iterate over the sample kernel and calculate occlusion factor
    float occlusion = 0.0;
    vec3 currentSample;
    float invKernelSize = 1.0 / float(kernelSize);
    for(int i = 0; i < kernelSize; ++i) {
        if (dot(normalize(samples[i]), Normal) > angleBias) {
            
            // scale samples so that they're more aligned to center of kernel
            currentSample = samples[i];
            currentSample *= lerp(0.1, 1.0, float(i) * invKernelSize);

            // get sample position
            vec3 samplePos = TBN * currentSample; // from tangent to view-space
            samplePos = FragPos + samplePos * radius;
            
            // project sample position (to sample texture) (to get position on screen/texture)
            vec4 offset = vec4(samplePos, 1.0);
            offset = uUsedProjectionMatrix * offset; // from view to clip-space
            offset.xyz /= offset.w; // perspective divide
            offset.xyz = offset.xyz * 0.5 + 0.5; // transform to range 0.0 - 1.0
            
            // get sample depth
            float sampleDepth = (uUsedViewMatrix * vec4(texture(gPosition, offset.xy).rgb, 1.0)).z; // get depth value of kernel sample
            
            // range check & accumulate
            float rangeCheck = smoothstep(0.0, 1.0, radius / abs(FragPos.z - sampleDepth));
            occlusion += (sampleDepth >= samplePos.z + depthBias ? 1.0 : 0.0) * rangeCheck;
        }
    }
    occlusion = 1.0 - (occlusion / float(kernelSize));
    
    FragColor = vec4(vec3(pow(occlusion, occlusionPower)), 1.0);
    //FragColor = vec4(FragPos + vec3(0.0, 0.0, 0.5), 1.0);
    //FragColor = vec4(WorldFragPos + vec3(0.5, 0.0, 0.0), 1.0);
    //FragColor = vec4(vec3(TBN * FragPos), 1.0);
}