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

        this.generateTerrain(300, 200, 30, 20);
        this.scene.add(this.terrain);

         // Create a simple GUI
         const gui = new GUI();
         gui.width = 200;

        const wireframeController = gui.add(this.terrain.material, 'wireframe');
        wireframeController.name('Wireframe');
    }

    private generateTerrain(width: number, depth: number, cols: number, rows: number): void
    {
        const vertices: gfx.Vector3[] = [];
        const normals: gfx.Vector3[] = [];
        const indices: number[] = [];

        // Compute vertices and normals
        for(let r=0; r < rows; r++)
        {
            for(let c=0; c < cols; c++)
            {
                const x = c / (cols-1) * width;
                const z = r / (rows-1) * depth;

                vertices.push(new gfx.Vector3(x - width/2, 0, z - depth/2));
                normals.push(new gfx.Vector3(0, 1, 0));
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
        this.terrain.createDefaultVertexColors();
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }
}