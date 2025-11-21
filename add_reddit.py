#!/usr/bin/env python3

file_path = 'C:/Users/Alin/AxosShop/client/src/pages/Home.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find YouTube </a> closing tag
youtube_close = content.find('aria-label="YouTube"')
if youtube_close == -1:
    print("ERROR: Could not find YouTube button")
    exit(1)

# Find the </a> after YouTube
youtube_end_idx = content.find('</a>', youtube_close) + 4

reddit_button = '''
                <a
                  href="https://www.reddit.com/user/Myhagaby/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-100 p-3 rounded-lg text-orange-600 hover:bg-orange-200 transition"
                  aria-label="Reddit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="1"></circle>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                  </svg>
                </a>'''

# Insert the Reddit button after YouTube
new_content = content[:youtube_end_idx] + reddit_button + content[youtube_end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Reddit button inserted successfully")

# Verify
with open(file_path, 'r', encoding='utf-8') as f:
    verify = f.read()
    if 'reddit.com/user/Myhagaby' in verify:
        print("✓ Verification passed: Reddit link found in file")
    else:
        print("✗ Verification failed: Reddit link not found")
