var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		HitInfo hit;
		
		Ray shadowRay = Ray(position, normalize(lights[i].position - position));
		if (IntersectRay( hit, shadowRay )){
			if (hit.t < length((lights[i].position - position)) ){
				continue;
			}
		}
		else{ //Blinn Model
			// color += mtl.k_d * lights[i].intensity;

			// // //Blinn: I (cos(theta)Kd + Ks(cos(x)^alpha))
			
			vec3 lightDir = normalize(lights[i].position - position);		
			vec3 viewDir = normalize(view);
			vec3 halfVec = normalize(lightDir + viewDir); //Angle between lightDir and viewDir

			float diffuse = max(dot(normal, lightDir),0.0);
			float spec = pow(max(dot(normal, halfVec),0.0),mtl.n);

			vec3 Kd = mtl.k_d;
			vec3 Ks = mtl.k_s;
			
			color += lights[i].intensity * ((Kd * diffuse) + (Ks*spec));
		}
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	float a = dot(ray.dir, ray.dir);

	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		
		float b = dot(2.0 * ray.dir, ray.pos - spheres[i].center); //2d * (p-c)
		float c = dot(ray.pos - spheres[i].center, ray.pos - spheres[i].center) - pow(spheres[i].radius,2.0); //(p-c)(p-c) - r^2

		float delta = pow(b,2.0) - (4.0*a*c);

		//Ray-sphere intersection
		if (delta < 0.0){
			continue; //No intersection
		}

		//Update HitInfo
		float t = (-b - sqrt(delta))/(2.0*a); //Pythag Theorem
		if (t < 0.001){
			continue;
		}
		foundHit = true;
		if (t < hit.t){
			hit.t = t;
			hit.position = ray.pos + (t * ray.dir);
			hit.mtl = spheres[i].mtl;
			hit.normal = normalize(hit.position - spheres[i].center);
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;

	if ( IntersectRay( hit, ray ) ) {
		// return vec4(0.5,0.5,0,1);

		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray, acts 
			HitInfo h;	// reflection hit info
			
			r = Ray(hit.position, normalize(reflect(-view, hit.normal)));
			
			if ( IntersectRay( h, r ) ) {
				//Hit found, so shade the hit point
				clr += k_s * Shade( h.mtl, h.position, h.normal, -r.dir );
				k_s *= h.mtl.k_s;

				//Update loop variables
				hit = h;
				view = normalize(-r.dir);

			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;