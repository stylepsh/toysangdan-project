import re
import random

unsplash_dolls = [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1585366119957-75cbaf8aacaa?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1594911470451-b844caaaef10?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1559803135-e103f6ca92f4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1558249216-72d8291f4862?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1541595904353-3456bbd0033c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1510425463958-dcced28da480?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
]

with open('data.js', 'r', encoding='utf-8') as f:
    data = f.read()

def repl_img(m):
    return random.choice(unsplash_dolls)

# Replace all picsum.photos with real plush images
data = re.sub(r'https://picsum\.photos/seed/[a-zA-Z0-9]+/\d+/\d+', repl_img, data)

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("Images successfully updated!")
