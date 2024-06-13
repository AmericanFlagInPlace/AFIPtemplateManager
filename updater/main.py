import json

def create_template(img_url, x, y, whitelist):
    # The base template
    template = {
        "faction": "/r/AmericanFlagInPlace",
        "contact": "https://discord.gg/AFIP",
        "notifications": "",
        "templates": [
            {
                "name": "r/AFIP Flag",
                "sources": [
                    img_url
                ],
                "x": x,
                "y": y
            }
        ],
        "whitelist": [],
        "blacklist": []
    }

    # Add whitelist entries
    for entry in whitelist:
        template['whitelist'].append({
            "name": entry[0],
            "url": entry[1]
        })

    # Write to file
    with open('template.json', 'w') as f:
        json.dump(template, f, indent=2)

# Usage
create_template(
    "https://i.imgur.com/ZKUCCFq.png", 
    314, 
    597, 
    [("axo", "https://rentry.org/Faline2023/raw")]
)