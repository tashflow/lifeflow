import os
import zipfile

output_filename = "lifeflow_stage_03b_export.zip"
exclude_dirs = {"node_modules", "dist", ".git", ".aistudio"}
exclude_files = {".env.local", output_filename, "create_zip.py"}

with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file in exclude_files:
                continue
            filePath = os.path.join(root, file)
            # Skip hidden files except .env.example and .gitignore
            if file.startswith('.') and file not in {'.env.example', '.gitignore'}:
                continue
            archivePath = os.path.relpath(filePath, '.')
            zipf.write(filePath, archivePath)
            print(f"Added: {archivePath}")

print(f"Successfully created {output_filename}")
