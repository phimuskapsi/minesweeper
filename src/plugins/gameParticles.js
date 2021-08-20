const particles = require('pixi-particles');
const particleArt = require('../assets/sprites/particle.png');


class MinesweeperParticleEngine {
    constructor(config, PIXI, Pixi) {
        this.config = config;
        this.elapsed = 0;
        this.emitter = null;
        this.particleImage = PIXI.Texture.from(particleArt);       
        this.PIXI = PIXI; 
        this.Pixi = Pixi;
        this.updateId = 0;
        this.setup();
    }

    destroy () { 
        this.emitter.destroy();
        this.emitter = null;
    }

    detonateBoard() {

    }

    drawExplosion(x,y) {
        //this.setup();
        this.elapsed = Date.now();
        this.update();
        this.emitter.updateOwnerPos(x+24,y+24);
        this.emitter.emit = true;
        this.emitter.resetPositionTracking();                
    }

    setup() {
        let art = this.particleImage;
        
        //this.stage.addChild();
        //this.Pixi.stage.addChild(this.emitterContainer);
        this.emitter = new particles.Emitter(
            this.Pixi.stage,
            art,
            this.config
        );        
    }

    update() {
        let self = this;
        
        const now = Date.now();
        const diff = now - self.elapsed;

        if (diff > 3000) {
            cancelAnimationFrame(self.updateId);
            self.destroy();
        } else {
            if (self.emitter) {
                self.emitter.update((now - self.elapsed) * 0.001);            
            }

            self.elapsed = now;             
            self.Pixi.renderer.render(self.Pixi.stage)
            self.updateId = requestAnimationFrame(() => this.update());
        }
    }
}

module.exports = MinesweeperParticleEngine;