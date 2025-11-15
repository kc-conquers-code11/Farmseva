 // add-data-editor-ids.js 
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;
const { glob } = require('glob');

class EditorIdTransformer {
  constructor() {
    this.rootDir = process.cwd();
    this.attributeName = 'data-editor-id';
    this.watchPatterns = [
      'app/**/*.{tsx,jsx}',
      'pages/**/*.{tsx,jsx}',
      'components/**/*.{tsx,jsx}',
      'src/**/*.{tsx,jsx}',
    ];
  }

  isLowerCaseHtmlTag(name) {
    if (!t.isJSXIdentifier(name)) return false;
    const n = name.name;
    return /^[a-z]/.test(n);
  }

  hasAttribute(attrs, attrName) {
    return attrs.some(
      (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === attrName
    );
  }

  transformFile(filePath) {
    try {
      const source = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(this.rootDir, filePath).replace(/\\/g, '/');

      // Parse the file
      const ast = parse(source, {
        sourceFilename: filePath,
        sourceType: 'module',
        plugins: ['typescript', 'jsx', 'decorators-legacy'],
      });

      let hasChanges = false;

      traverse(ast, {
        JSXOpeningElement: (path) => {
          const opening = path.node;

          // Only tag lowercase HTML elements (not React components)
          const isHtml = this.isLowerCaseHtmlTag(opening.name);
          if (!isHtml) return;

          // Skip if already has the attribute
          if (this.hasAttribute(opening.attributes, this.attributeName)) return;

          // Get location info
          const loc = opening.loc?.start;
          const line = loc?.line ?? 0;
          const column = (loc?.column ?? 0) + 1;

          const idValue = `${relPath}:${line}:${column}`;

          const attr = t.jsxAttribute(
            t.jsxIdentifier(this.attributeName),
            t.stringLiteral(idValue)
          );

          // Add the attribute as the first attribute
          opening.attributes.unshift(attr);
          hasChanges = true;
        },
      });

      if (hasChanges) {
        // Generate the modified code
        const output = generate(ast, {
          retainLines: true,
          compact: false,
        });

        // Write back to the file
        fs.writeFileSync(filePath, output.code, 'utf-8');
        console.log(`✓ Added editor IDs to: ${relPath}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  run() {
    console.log('🔄 Adding data-editor-id attributes to HTML elements...');
    
    let totalFiles = 0;
    let modifiedFiles = 0;

    this.watchPatterns.forEach(pattern => {
      const files = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**',
        ]
      });

      files.forEach((filePath) => {
        if (filePath.match(/\.(tsx|jsx)$/)) {
          totalFiles++;
          if (this.transformFile(filePath)) {
            modifiedFiles++;
          }
        }
      });
    });

    console.log(`\n✅ Complete! Processed ${totalFiles} files, modified ${modifiedFiles} files.`);
  }
}

// Run the transformer
const transformer = new EditorIdTransformer();
transformer.run();
