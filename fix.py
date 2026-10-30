import os, re
for root, dirs, files in os.walk('client/src'):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            new = content.replace('\\\\\"', '\"').replace(\"\\\\'\", \"'\")
            if new != content:
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(new)
                print('fixed', path)
