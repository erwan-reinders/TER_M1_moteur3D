#version 300 es
precision highp float;

layout (location = 0) out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;

uniform samplerCube skybox;

uniform vec3 uViewPos;

bool closeToZeroWithBias(vec3 value) {
    float bias = 0.0001;
    return value.x < bias && value.x > -bias && value.y < bias && value.y > -bias && value.z < bias && value.z > -bias;
}

void main()
{
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;

    if (!closeToZeroWithBias(FragPos)) {
        vec3 I = normalize(FragPos - uViewPos);
        vec3 R = reflect(I, Normal);

        vec3 cubemapColor = texture(skybox, R).rgb;

        FragColor = vec4(cubemapColor, 1.0);
    }
    else {
         FragColor = vec4(vec3(0.0), 1.0);
    }
}