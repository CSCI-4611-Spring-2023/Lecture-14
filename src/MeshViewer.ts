/* Lecture 14
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class MeshViewer extends gfx.GfxApp
{
    private cameraControls: gfx.OrbitControls;
    private skybox: gfx.Mesh;
    private axes: gfx.Axes3;

    constructor()
    {
        super();

        this.cameraControls = new gfx.OrbitControls(this.camera);
        this.skybox = gfx.MeshFactory.createBox(1000, 1000, 500);
        this.axes = new gfx.Axes3(20);
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, 1, 1000)
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
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }
}