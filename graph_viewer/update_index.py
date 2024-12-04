import os

def update_index():
    """
    Generates HTML links for JSON files in the ./graphs directory and updates index.html.
    """

    # Get list of JSON files
    json_files = [f for f in os.listdir('./graphs') if f.endswith('.json')]
    json_files.sort()

    # Generate HTML links
    links = []
    for filename in json_files:
        name = filename[:-5]  # Remove .json extension
        link = f'<a href="viewer.html?g={name}" target="myiframe">{name}</a>'
        links.append(link)

    # Join links with newline characters
    links_html = '\n'.join(links)

    # Read index.html
    with open('index.html', 'r') as f:
        index_content = f.read()

    # Replace sidebar content
    start_tag = '<div class="sidebar">'
    end_tag = '</div>'
    new_index_content = index_content.replace(
        index_content[index_content.index(start_tag):index_content.index(end_tag) + len(end_tag)],
        f'{start_tag}\n{links_html}\n{end_tag}'
    )

    # Write updated index.html
    with open('index.html', 'w') as f:
        f.write(new_index_content)

if __name__ == "__main__":
    update_index()