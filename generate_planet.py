#!/usr/bin/env python3
"""
Photorealistic rotating Earth GIF — Oil Risk Monitor hero.
Output: frontend/public/planet/planet.gif
400x400px · 36 frames · 16fps · loop infinito · fondo blanco
"""
import numpy as np
from PIL import Image
import math, os

# ── Config ─────────────────────────────────────────────────────────────────────
SIZE   = 400
RADIUS = 190
FRAMES = 36
FPS    = 16
TILT   = math.radians(23.5)      # inclinación axial real de la Tierra
OUTPUT = "frontend/public/planet/planet.gif"
TW, TH = 1024, 512               # resolución del mapa de textura

# ── Noise LUT-based 3D (vectorizado) ──────────────────────────────────────────

def lut_noise3d(X, Y, Z, freq, seed):
    """Value noise 3D con tabla de lookup, sin seam."""
    N = 64
    rng = np.random.RandomState(int(seed) & 0xFFFF)
    lut = rng.rand(N + 1, N + 1, N + 1).astype(np.float32)
    xs = ((X * freq) % N + N) % N
    ys = ((Y * freq) % N + N) % N
    zs = ((Z * freq) % N + N) % N
    xi  = xs.astype(np.int32); yi  = ys.astype(np.int32); zi  = zs.astype(np.int32)
    xf  = (xs - xi).astype(np.float32)
    yf  = (ys - yi).astype(np.float32)
    zf  = (zs - zi).astype(np.float32)
    u = xf*xf*(3-2*xf); v = yf*yf*(3-2*yf); w = zf*zf*(3-2*zf)
    xi1=(xi+1)%N; yi1=(yi+1)%N; zi1=(zi+1)%N
    n000=lut[xi,yi,zi];   n100=lut[xi1,yi,zi]
    n010=lut[xi,yi1,zi];  n110=lut[xi1,yi1,zi]
    n001=lut[xi,yi,zi1];  n101=lut[xi1,yi,zi1]
    n011=lut[xi,yi1,zi1]; n111=lut[xi1,yi1,zi1]
    x00 = n000+u*(n100-n000); x10 = n010+u*(n110-n010)
    x01 = n001+u*(n101-n001); x11 = n011+u*(n111-n011)
    y0  = x00 +v*(x10 -x00 ); y1  = x01 +v*(x11 -x01 )
    return (y0 + w*(y1-y0)).astype(np.float32)

def fbm(X, Y, Z, octs=7, seed=42):
    """Fractal Brownian Motion — 7 capas (océano→nieve)."""
    val = np.zeros_like(X, dtype=np.float32)
    amp = 0.5; freq = 1.0
    for i in range(octs):
        val += amp * (2.0 * lut_noise3d(X, Y, Z, freq * 3.0, seed + i * 17) - 1.0)
        amp *= 0.5; freq *= 2.0
    mn, mx = val.min(), val.max()
    return ((val - mn) / (mx - mn + 1e-9)).astype(np.float32)

# ── Textura equirectangular ────────────────────────────────────────────────────

print("[1/4] Generando mapa de terreno (FBM 7 octavas)...")
lons = np.linspace(-np.pi, np.pi, TW, endpoint=False, dtype=np.float32)
lats = np.linspace(np.pi/2, -np.pi/2, TH, dtype=np.float32)
LON, LAT = np.meshgrid(lons, lats)
CX = (np.cos(LAT) * np.cos(LON)).astype(np.float32)
CY = (np.cos(LAT) * np.sin(LON)).astype(np.float32)
CZ = np.sin(LAT).astype(np.float32)

terrain = fbm(CX, CY, CZ, 7, 42)

print("[2/4] Generando mapa de nubes (FBM 5 octavas)...")
clouds = fbm(CX, CY, CZ, 5, 137)
clouds = np.where(clouds > 0.52, (clouds - 0.52) / 0.48, 0.0).astype(np.float32)

# ── Colormap de terreno (7 capas) ─────────────────────────────────────────────

STOPS = [
    (0.00, (0.04, 0.07, 0.30)),  # océano profundo
    (0.35, (0.07, 0.22, 0.68)),  # océano medio
    (0.44, (0.13, 0.34, 0.76)),  # agua poco profunda
    (0.46, (0.93, 0.85, 0.62)),  # playa / costa
    (0.50, (0.46, 0.66, 0.30)),  # llanura baja
    (0.62, (0.30, 0.54, 0.23)),  # llanura alta / pradera
    (0.72, (0.38, 0.38, 0.26)),  # tierras altas / colinas
    (0.82, (0.50, 0.42, 0.34)),  # montañas
    (0.90, (0.69, 0.66, 0.62)),  # montañas altas
    (1.00, (0.94, 0.96, 1.00)),  # nieve perpetua
]

def apply_colormap(h):
    R = np.zeros_like(h); G = np.zeros_like(h); B = np.zeros_like(h)
    for i in range(len(STOPS) - 1):
        h0, c0 = STOPS[i]; h1, c1 = STOPS[i+1]
        m = (h >= h0) & (h < h1)
        t = np.where(m, (h - h0) / (h1 - h0 + 1e-9), 0.0)
        R = np.where(m, c0[0] + t*(c1[0]-c0[0]), R)
        G = np.where(m, c0[1] + t*(c1[1]-c0[1]), G)
        B = np.where(m, c0[2] + t*(c1[2]-c0[2]), B)
    return np.stack([R, G, B], 2).astype(np.float32)

print("[3/4] Construyendo textura color...")
tex_rgb  = apply_colormap(terrain)          # TH×TW×3 float [0,1]
is_ocean = (terrain < 0.44).astype(np.float32)  # TH×TW

# ── Geometría de la esfera (precomputado) ─────────────────────────────────────

cx = cy = SIZE // 2
px, py = np.meshgrid(np.arange(SIZE, dtype=np.float32),
                     np.arange(SIZE, dtype=np.float32))
dx = px - cx; dy = py - cy
r2 = (dx**2 + dy**2).astype(np.float32)
r  = np.sqrt(r2)
mask = r2 <= RADIUS**2

# Normales en espacio de vista (cámara en +Z)
nx0 = np.where(mask,  dx / RADIUS, 0.0).astype(np.float32)
ny0 = np.where(mask, -dy / RADIUS, 0.0).astype(np.float32)   # flip Y pantalla
nz0 = np.where(mask, np.sqrt(np.maximum(0.0, 1.0 - nx0**2 - ny0**2)), 0.0).astype(np.float32)

# Inclinación axial 23.5° (rotación alrededor del eje X)
ct, st = math.cos(TILT), math.sin(TILT)
nx_t = nx0
ny_t = (ny0 * ct - nz0 * st).astype(np.float32)
nz_t = (ny0 * st + nz0 * ct).astype(np.float32)

# Dirección del sol (arriba-izquierda, normalizada)
sun = np.array([0.35, 0.55, 0.76], dtype=np.float32)
sun /= np.linalg.norm(sun)
V   = np.array([0.0, 0.0, 1.0], dtype=np.float32)   # dirección de la cámara

# Fresnel: brillo atmosférico en bordes de la esfera
fresnel = np.where(mask, np.clip(1.0 - nz0, 0.0, 1.0)**2 * 0.58, 0.0).astype(np.float32)
ATMO_COLOR = np.array([0.35, 0.60, 1.00], dtype=np.float32)

# Halo exterior (fuera de la esfera, fondo blanco → azul suave)
halo_a = np.where(r > RADIUS,
    np.exp(-np.maximum(0.0, r - RADIUS) * 0.18) * 0.65,
    0.0).astype(np.float32)
HALO_COLOR = np.array([0.58, 0.77, 1.00], dtype=np.float32)

# ── Render frames ──────────────────────────────────────────────────────────────

pil_frames = []
print(f"[4/4] Renderizando {FRAMES} frames...")

for fi in range(FRAMES):
    rot = 2.0 * math.pi * fi / FRAMES
    cr, sr = math.cos(rot), math.sin(rot)

    # Rotación del planeta (alrededor del eje Y, en espacio post-tilt)
    nx_r = (nx_t * cr + nz_t * sr).astype(np.float32)
    ny_r = ny_t
    nz_r = (-nx_t * sr + nz_t * cr).astype(np.float32)

    # Normal 3D → latitud / longitud
    lat_m = np.where(mask, np.arcsin(np.clip(ny_r, -1.0, 1.0)), 0.0)
    lon_m = np.where(mask, np.arctan2(nz_r, nx_r), 0.0)

    # Coordenadas UV en la textura
    u_f = ((lon_m + math.pi) / (2.0 * math.pi) * TW).astype(np.float32)
    v_f = ((math.pi / 2.0 - lat_m) / math.pi * TH).astype(np.float32)
    ui  = np.clip(u_f.astype(np.int32), 0, TW - 1)
    vi  = np.clip(v_f.astype(np.int32), 0, TH - 1)

    # Muestrear terreno
    surf      = tex_rgb[vi, ui].copy()   # SIZE×SIZE×3
    oce_mask  = is_ocean[vi, ui]         # SIZE×SIZE

    # ── Casquetes polares (basado en latitud real, no en textura) ──────────────
    polar = np.clip((np.abs(lat_m) - 1.20) / 0.22, 0.0, 1.0).astype(np.float32)
    surf  = surf * (1.0 - polar[:,:,None]) + np.array([0.92, 0.95, 1.00]) * polar[:,:,None]

    # ── Nubes (rotan a velocidad ligeramente diferente al planeta) ────────────
    cloud_off = int(fi * TW * 1.18 / FRAMES) % TW
    uc = (ui + cloud_off) % TW
    cd = clouds[vi, uc]   # densidad de nubes, SIZE×SIZE

    # ── Iluminación 3D ─────────────────────────────────────────────────────────
    N3   = np.stack([nx_r, ny_r, nz_r], 2)  # SIZE×SIZE×3

    # Diffuse (Lambertiano)
    diff = np.clip(np.einsum('ijk,k->ij', N3, sun), 0.0, 1.0).astype(np.float32)
    amb  = 0.13

    # Specular (Phong): sólo en océano (reflejo solar en agua)
    sdN  = np.einsum('ijk,k->ij', N3, sun)[:,:,None]
    Rvec = (2.0 * sdN * N3 - sun).astype(np.float32)
    spec = np.clip(np.einsum('ijk,k->ij', Rvec, V), 0.0, 1.0) ** 50 * 0.88
    spec = (spec * oce_mask).astype(np.float32)

    total_light = (diff + amb + spec)[:,:,None]
    lit = np.clip(surf * total_light, 0.0, 1.0)

    # ── Nubes iluminadas ───────────────────────────────────────────────────────
    cloud_light = (diff * 0.90 + amb)[:,:,None]
    cloud_alpha = (cd * 0.88)[:,:,None]
    lit = lit * (1.0 - cloud_alpha) + cloud_light * cloud_alpha

    # ── Efecto Fresnel: atmósfera en los bordes ────────────────────────────────
    f3  = fresnel[:,:,None]
    lit = lit * (1.0 - f3) + ATMO_COLOR * f3

    # ── Ensamble: fondo blanco ─────────────────────────────────────────────────
    img = np.ones((SIZE, SIZE, 3), dtype=np.float32)
    m3  = mask[:,:,None]
    img = np.where(m3, lit, img)

    # Halo atmosférico exterior (tinta azul suave sobre blanco)
    h3  = halo_a[:,:,None]
    img = np.where(~m3, img * (1.0 - h3) + HALO_COLOR * h3, img)

    frame_u8 = (np.clip(img, 0.0, 1.0) * 255).astype(np.uint8)
    pil_frames.append(Image.fromarray(frame_u8, 'RGB'))

    if (fi + 1) % 9 == 0:
        print(f"    Frame {fi+1}/{FRAMES} OK")

# ── Guardar GIF ────────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
dur_ms = 1000 // FPS   # 62 ms/frame → 16 fps

print("Guardando GIF (quantize + loop)...")
pil_frames[0].save(
    OUTPUT,
    save_all=True,
    append_images=pil_frames[1:],
    loop=0,
    duration=dur_ms,
    optimize=False,
)

sz = os.path.getsize(OUTPUT) / 1_000_000
print(f"\nDone: {OUTPUT}")
print(f"   {FRAMES} frames / {FPS} fps / {SIZE}x{SIZE}px / {sz:.1f} MB")
