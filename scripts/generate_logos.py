import os
import base64
from PIL import Image, ImageDraw

src_path = r'C:/Users/moises.leon/.gemini/antigravity/brain/b07ce9ef-0573-47bc-a60e-051de574e460/.user_uploaded/media_1793299670697_c832dd94.jpg'
orig = Image.open(src_path).convert('RGB')
w, h = orig.size

# Ensure directories exist
os.makedirs('frontend/public/icons', exist_ok=True)
os.makedirs('frontend/src/assets', exist_ok=True)

# 1. Full square logo (1024x1024)
orig.save('frontend/public/logo.png', 'PNG', optimize=True)
orig.save('frontend/src/assets/logo.png', 'PNG', optimize=True)

# 2. Circular cutout logo (transparent outside circle)
scale = 2
mask = Image.new('L', (w * scale, h * scale), 0)
draw = ImageDraw.Draw(mask)
cx, cy, r = w * scale // 2, h * scale // 2, int(456 * scale)
draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
mask = mask.resize((w, h), Image.Resampling.LANCZOS)

rgba = orig.convert('RGBA')
rgba.putalpha(mask)
rgba.save('frontend/public/logo-circle.png', 'PNG', optimize=True)
rgba.save('frontend/src/assets/logo-circle.png', 'PNG', optimize=True)

# 3. PWA Icons: 512x512 and 192x192
icon_512 = orig.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('frontend/public/icons/icon-512.png', 'PNG', optimize=True)

icon_192 = orig.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save('frontend/public/icons/icon-192.png', 'PNG', optimize=True)

# 4. Maskable Icon: 512x512 with safe area (Android adaptive icons safe zone is 80% circle)
bg_color = (254, 241, 232)
maskable = Image.new('RGB', (512, 512), bg_color)
safe_size = int(512 * 0.78)
scaled_logo = orig.resize((safe_size, safe_size), Image.Resampling.LANCZOS)
offset = (512 - safe_size) // 2
maskable.paste(scaled_logo, (offset, offset))
maskable.save('frontend/public/icons/icon-maskable-512.png', 'PNG', optimize=True)

# 5. Small favicons
fav_32 = orig.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save('frontend/public/icons/favicon-32x32.png', 'PNG', optimize=True)
fav_16 = orig.resize((16, 16), Image.Resampling.LANCZOS)
fav_16.save('frontend/public/icons/favicon-16x16.png', 'PNG', optimize=True)

# Multi-resolution favicon.ico
fav_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_imgs = [orig.resize(s, Image.Resampling.LANCZOS) for s in fav_sizes]
ico_imgs[0].save('frontend/public/favicon.ico', format='ICO', sizes=fav_sizes, append_images=ico_imgs[1:])

# 6. High quality SVG Favicon with embedded circular logo
with open('frontend/public/logo-circle.png', 'rb') as f:
    b64_circle = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <clipPath id="circle-clip">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,{b64_circle}" width="512" height="512" clip-path="url(#circle-clip)" />
</svg>
'''
with open('frontend/public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('All logo and icon assets generated successfully!')
