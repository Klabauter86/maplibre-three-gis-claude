import * as THREE from 'three';
import * as maplibregl from 'maplibre-gl';

const DEG2RAD = Math.PI / 180;

function splitFeatures(geojson) {
  const points = geojson?.features?.filter((feature) => feature.geometry?.type === 'Point') ?? [];
  return {
    trees: points.filter((feature) => feature.properties?.kind === 'tree'),
    rocks: points.filter((feature) => feature.properties?.kind === 'rock'),
  };
}

function mercatorLocalMeters(lngLat, originLngLat, originMercator) {
  const merc = maplibregl.MercatorCoordinate.fromLngLat(lngLat, 0);
  const meterScale = originMercator.meterInMercatorCoordinateUnits();
  return new THREE.Vector3(
    (merc.x - originMercator.x) / meterScale,
    0,
    (originMercator.y - merc.y) / meterScale,
  );
}

export function createNatureLayer({ data, status }) {
  const { trees, rocks } = splitFeatures(data);

  return {
    id: 'three-nature',
    type: 'custom',
    renderingMode: '3d',

    onAdd(map, gl) {
      this.map = map;
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      // Three.js uses Y-up. Rotate/mirror the whole local scene so
      // local coordinates are X=east, Y=up, Z=north in MapLibre.
      this.scene.rotateX(Math.PI / 2);
      this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));
      this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
      this.renderer.autoClear = false;

      const center = map.getCenter();
      this.originLngLat = [center.lng, center.lat];
      this.originElevation = map.queryTerrainElevation(this.originLngLat) ?? 0;
      this.originMercator = maplibregl.MercatorCoordinate.fromLngLat(this.originLngLat, this.originElevation);
      this.meterScale = this.originMercator.meterInMercatorCoordinateUnits();

      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.2));
      const sun = new THREE.DirectionalLight(0xffffff, 2.2);
      sun.position.set(-120, 180, 80);
      this.scene.add(sun);

      const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.18, 1.8, 6);
      trunkGeometry.translate(0, 0.9, 0);
      const crownGeometry = new THREE.ConeGeometry(0.8, 3.4, 7);
      crownGeometry.translate(0, 3.2, 0);
      const rockGeometry = new THREE.IcosahedronGeometry(1, 1);

      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x69452a });
      const crownMaterial = new THREE.MeshLambertMaterial({ color: 0x2f6c3b });
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x777b78, flatShading: true });

      this.trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, trees.length);
      this.crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, trees.length);
      this.rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, rocks.length);
      this.trunks.frustumCulled = false;
      this.crowns.frustumCulled = false;
      this.rocks.frustumCulled = false;

      const matrix = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const yAxis = new THREE.Vector3(0, 1, 0);

      trees.forEach((feature, index) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties ?? {};
        const terrainElevation = map.queryTerrainElevation([lng, lat]) ?? this.originElevation;
        position.copy(mercatorLocalMeters([lng, lat], this.originLngLat, this.originMercator));
        position.y = terrainElevation - this.originElevation;
        quaternion.setFromAxisAngle(yAxis, (props.rotation ?? 0) * DEG2RAD);
        const heightScale = Math.max(0.2, (props.height ?? 15) / 5.0);
        const crownScale = props.crown ?? 1;
        scale.set(0.9, heightScale, 0.9);
        matrix.compose(position, quaternion, scale);
        this.trunks.setMatrixAt(index, matrix);
        scale.set(crownScale, heightScale, crownScale);
        matrix.compose(position, quaternion, scale);
        this.crowns.setMatrixAt(index, matrix);
      });

      rocks.forEach((feature, index) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties ?? {};
        const terrainElevation = map.queryTerrainElevation([lng, lat]) ?? this.originElevation;
        position.copy(mercatorLocalMeters([lng, lat], this.originLngLat, this.originMercator));
        position.y = terrainElevation - this.originElevation + (props.height ?? 2) * 0.25;
        quaternion.setFromAxisAngle(yAxis, (props.rotation ?? 0) * DEG2RAD);
        const s = props.scale ?? 1;
        scale.set(s * 1.25, Math.max(0.4, (props.height ?? 2) * 0.55), s);
        matrix.compose(position, quaternion, scale);
        this.rocks.setMatrixAt(index, matrix);
      });

      this.trunks.instanceMatrix.needsUpdate = true;
      this.crowns.instanceMatrix.needsUpdate = true;
      this.rocks.instanceMatrix.needsUpdate = true;
      this.scene.add(this.trunks, this.crowns, this.rocks);
      status?.set(`${trees.length} Bäume + ${rocks.length} Felsen · GPU-Instancing aktiv`, 'ready');
    },

    render(gl, args) {
      const matrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
      const translation = new THREE.Matrix4().makeTranslation(
        this.originMercator.x,
        this.originMercator.y,
        this.originMercator.z,
      );
      const scale = new THREE.Matrix4().makeScale(this.meterScale, -this.meterScale, this.meterScale);
      this.camera.projectionMatrix.copy(matrix).multiply(translation).multiply(scale);

      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
    },

    onRemove() {
      this.trunks?.geometry.dispose();
      this.crowns?.geometry.dispose();
      this.rocks?.geometry.dispose();
      this.trunks?.material.dispose();
      this.crowns?.material.dispose();
      this.rocks?.material.dispose();
      this.renderer?.dispose();
    },
  };
}
