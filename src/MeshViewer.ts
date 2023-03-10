/* Lecture 14
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private skybox: gfx.Mesh;
    private axes: gfx.Axes3;
    private terrain: gfx.MorphMesh;

    constructor()
    {
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);
        this.skybox = gfx.MeshFactory.createBox(1000, 1000, 1000);
        this.axes = new gfx.Axes3(20);
        this.terrain = new gfx.MorphMesh();
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, 1, 1500)
        this.cameraControls.setOrbit(-Math.PI/4, 0);
        this.cameraControls.setDistance(230);
        
        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.25, 0.25, 0.25));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.75, 0.75, 0.75));
        directionalLight.position.set(1, 1, 1)
        this.scene.add(directionalLight);

        // Set the skybox material
        this.skybox.material = new gfx.UnlitMaterial();
        this.skybox.material.setColor(new gfx.Color(0.698, 1, 1));
        this.skybox.material.side = gfx.Side.BACK;
        this.scene.add(this.skybox);

        // Add the axes to the scene
        this.axes.position.set(0, 0.1, 0);
        this.scene.add(this.axes);

        this.terrain.material.texture = new gfx.Texture('./assets/sand.jpg');
        this.generateTerrain(300, 200, 30, 20, 5);
        this.scene.add(this.terrain);

         // Create a simple GUI
         const gui = new GUI();
         gui.width = 200;

        const morphController = gui.add(this.terrain, 'morphAlpha', 0, 1);
        morphController.name('Alpha');

        const wireframeController = gui.add(this.terrain.material, 'wireframe');
        wireframeController.name('Wireframe');
    }

    private generateTerrain(width: number, depth: number, cols: number, rows: number, textureTiling: number): void
    {
        const vertices: gfx.Vector3[] = [];
        const normals: gfx.Vector3[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        // Compute vertices and normals
        for(let r=0; r < rows; r++)
        {
            for(let c=0; c < cols; c++)
            {
                const x = c / (cols-1) * width;
                const z = r / (rows-1) * depth;

                vertices.push(new gfx.Vector3(x - width/2, 0, z - depth/2));
                normals.push(new gfx.Vector3(0, 1, 0));
                uvs.push(textureTiling * x / width, textureTiling * z / depth);
            }
        }

        // Compute the indices
        for(let r=0; r < rows-1; r++)
        {
            for(let c=0; c < cols-1; c++)
            {
                const upperLeftIndex = cols * r + c;
                const upperRightIndex = upperLeftIndex + 1;
                const lowerLeftIndex = upperLeftIndex + cols;
                const lowerRightIndex = lowerLeftIndex + 1;

                indices.push(upperLeftIndex, lowerLeftIndex, upperRightIndex);
                indices.push(upperRightIndex, lowerLeftIndex, lowerRightIndex);
            }
        }

        this.terrain.setVertices(vertices);
        this.terrain.setNormals(normals);
        this.terrain.setIndices(indices);
        this.terrain.setTextureCoordinates(uvs);
        this.terrain.createDefaultVertexColors();

        const morphVertices: gfx.Vector3[] = [];
        for(let i=0; i < vertices.length; i++)
            morphVertices.push(vertices[i].clone());

        for(let i=0; i < 100; i++)
            this.generateHillOrValley(morphVertices);

        const morphNormals = this.computeVertexNormals(morphVertices, indices);

        this.terrain.setMorphTargetVertices(morphVertices);
        this.terrain.setMorphTargetNormals(morphNormals);
    }

    private generateHillOrValley(vertices: gfx.Vector3[]): void
    {
        const centerIndex = Math.floor(Math.random() * (vertices.length-1));
        const centerPosition = vertices[centerIndex].clone();
        const radius = Math.random() * 50 + 20;
        const height = Math.random() * 50 - 25;

        for(let i=0; i < vertices.length; i++)
        {
            const distanceFactor = centerPosition.distanceTo(vertices[i]) / radius;
            vertices[i].y += (1 / Math.exp(distanceFactor*distanceFactor)) * height;
        }
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }

    private computeVertexNormals(vertices: gfx.Vector3[], indices: number[]): gfx.Vector3[]
    {
        // Initialize the vertex normals to zero
        const vertexNormals: gfx.Vector3[] = [];
        const vertexTriangleCount: number[] = [];
        for(let i=0; i < vertices.length; i++)
        {
            vertexNormals.push(new gfx.Vector3(0, 0, 0));
            vertexTriangleCount.push(0);
        }

        // Compute the normal for each triangle and add it to each vertex normal
        for(let i=0; i < indices.length; i+=3)
        {
            const v1 = vertices[indices[i]];
            const v2 = vertices[indices[i+1]];
            const v3 = vertices[indices[i+2]];

            const n1 = gfx.Vector3.subtract(v2, v1);
            const n2 = gfx.Vector3.subtract(v3, v1);

            n1.normalize();
            n2.normalize();

            const triangleNormal = gfx.Vector3.cross(n1, n2);

            vertexNormals[indices[i]].add(triangleNormal);
            vertexNormals[indices[i+1]].add(triangleNormal);
            vertexNormals[indices[i+2]].add(triangleNormal);

            vertexTriangleCount[indices[i]]++;
            vertexTriangleCount[indices[i+1]]++;
            vertexTriangleCount[indices[i+2]]++;
        }

        // Divide each vertex normal by the number of triangles to compute the average
        for(let i=0; i < vertexNormals.length; i++)
        {
            vertexNormals[i].multiplyScalar(1/vertexTriangleCount[i]);
        }
        
        return vertexNormals;
    }
}